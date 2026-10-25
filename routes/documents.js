const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../models/dbAdapter');
const { verifyToken } = require('../middleware/auth');
const storageService = require('../services/storageService');

// Use Memory Storage for Multer to support both AWS S3 streaming and local disk writing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: storageService.MAX_FILE_SIZE }
});

// GET /api/documents/storage-status: Check active storage provider and AWS S3 configuration
router.get('/storage-status', (req, res) => {
  const status = storageService.getStorageStatus();
  res.json({
    success: true,
    data: status
  });
});

// POST /api/documents/upload: Upload document to active storage (Amazon S3 or Local)
router.post('/upload', verifyToken, (req, res) => {
  upload.single('documentFile')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size exceeds 5MB limit. Please upload a smaller file.'
        });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file selected. Please choose a document to upload.'
      });
    }

    // Server-side validation of file type and size
    const validation = storageService.validateFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    try {
      const category = (req.body.category || 'Other').trim();

      // Delegate upload to Storage Service (Local or Amazon S3)
      const uploadResult = await storageService.uploadDocument({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        userId: req.user.id,
        category: category
      });

      // Save document metadata in database
      const docRecord = await db.documents.create({
        userId: req.user.id,
        userName: req.user.name,
        originalName: req.file.originalname,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        fileType: uploadResult.fileType,
        mimeType: uploadResult.mimeType,
        category: category,
        storageProvider: uploadResult.storageProvider,
        s3Key: uploadResult.s3Key || '',
        filePath: uploadResult.filePath,
        uploadDate: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        message: `Document uploaded successfully! ${uploadResult.storageNote}.`,
        storageProvider: uploadResult.storageProvider,
        document: docRecord
      });
    } catch (saveErr) {
      console.error('Document upload error:', saveErr);
      res.status(500).json({
        success: false,
        message: saveErr.message || 'Failed to process document upload.'
      });
    }
  });
});

// GET /api/documents: List documents for current user (or all if admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    let docs;
    if (req.user.role === 'admin') {
      docs = await db.documents.find();
    } else {
      docs = await db.documents.find({ userId: req.user.id });
    }

    const storageStatus = storageService.getStorageStatus();

    // Attach download URLs (presigned URL for S3, direct API download endpoint for local)
    const enrichedDocs = await Promise.all(
      docs.map(async (doc) => {
        try {
          const dlInfo = await storageService.getDownloadInfo(doc);
          return {
            ...doc,
            downloadUrl: dlInfo.downloadUrl,
            isPresigned: dlInfo.isPresigned,
            storageProvider: doc.storageProvider || 'local'
          };
        } catch (e) {
          return {
            ...doc,
            downloadUrl: `/api/documents/${doc._id || doc.id}/download`,
            isPresigned: false,
            storageProvider: doc.storageProvider || 'local'
          };
        }
      })
    );

    res.json({
      success: true,
      count: enrichedDocs.length,
      storageStatus: storageStatus,
      data: enrichedDocs
    });
  } catch (err) {
    console.error('Fetch documents error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch uploaded documents.'
    });
  }
});

// GET /api/documents/:id/download: Download a document securely (Presigned S3 URL or Local file stream)
router.get('/:id/download', verifyToken, async (req, res) => {
  try {
    const doc = await db.documents.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    // Strict Authorization check: user must own the document unless an authorized admin
    if (doc.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own documents.'
      });
    }

    const dlInfo = await storageService.getDownloadInfo(doc);

    if (dlInfo.storageProvider === 's3' && dlInfo.isPresigned) {
      // If client requests redirect, redirect directly to S3 presigned URL
      if (req.query.redirect === 'true' || req.headers.accept?.includes('text/html')) {
        return res.redirect(dlInfo.downloadUrl);
      }
      return res.json({
        success: true,
        downloadUrl: dlInfo.downloadUrl,
        expiresInSeconds: dlInfo.expiresInSeconds,
        storageProvider: 's3'
      });
    }

    // Local file stream
    if (fs.existsSync(dlInfo.localDiskPath)) {
      return res.download(dlInfo.localDiskPath, doc.originalName);
    } else {
      return res.status(404).json({
        success: false,
        message: 'Physical document file not found on server.'
      });
    }
  } catch (err) {
    console.error('Download document error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error generating download.'
    });
  }
});

// DELETE /api/documents/:id: Delete document from active storage and database
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await db.documents.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document not found.'
      });
    }

    // Ownership check
    if (doc.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own documents.'
      });
    }

    // Delete from storage provider (Amazon S3 or Local disk)
    await storageService.deleteDocumentFile(doc);

    // Delete metadata record from database
    await db.documents.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: `Document deleted successfully from ${doc.storageProvider === 's3' ? 'Amazon S3 cloud storage' : 'local storage'}.`
    });
  } catch (err) {
    console.error('Delete document error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document.'
    });
  }
});

module.exports = router;
