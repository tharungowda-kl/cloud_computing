/**
 * GraminSeva - Configurable Document Storage Service
 * Supports:
 *  1. Local Storage (Default - files stored in /uploads directory)
 *  2. Amazon S3 Cloud Storage (AWS SDK v3 with private objects & short-lived presigned URLs)
 *
 * Automatically detects whether AWS S3 credentials and bucket are configured.
 * Falls back safely to local storage if AWS is not configured.
 */

const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Allowed file types and max size (5 MB)
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Determine Active Storage Configuration
const configuredProvider = (process.env.STORAGE_PROVIDER || 'local').toLowerCase().trim();
const bucketName = (process.env.S3_BUCKET_NAME || '').trim();
const awsRegion = (process.env.AWS_REGION || 'ap-south-1').trim();

let s3Client = null;
let isS3Available = false;
let s3InitMessage = 'Local Storage Active';

// Initialize S3 Client if configured
if (configuredProvider === 's3') {
  if (!bucketName) {
    console.warn('[Storage] Warning: STORAGE_PROVIDER=s3 but S3_BUCKET_NAME is not set in .env. Falling back to Local Storage.');
    s3InitMessage = 'Falling back to Local Storage: S3_BUCKET_NAME is not configured in .env';
  } else {
    try {
      const clientConfig = {
        region: awsRegion
      };

      // If explicit access keys are provided in .env, use them (useful for local dev).
      // Otherwise, the AWS SDK v3 automatically resolves credentials via the standard
      // AWS Credential Provider Chain (IAM Roles on EC2/ECS/Lambda, ~/.aws/credentials, etc.)
      if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        clientConfig.credentials = {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim()
        };
        if (process.env.AWS_SESSION_TOKEN) {
          clientConfig.credentials.sessionToken = process.env.AWS_SESSION_TOKEN.trim();
        }
      }

      s3Client = new S3Client(clientConfig);
      isS3Available = true;
      s3InitMessage = `Amazon S3 Storage Active (Bucket: ${bucketName}, Region: ${awsRegion})`;
      console.log(`[Storage] ${s3InitMessage}`);
    } catch (clientErr) {
      console.error('[Storage] Error initializing AWS S3 Client:', clientErr.message);
      s3InitMessage = `S3 Initialization Failed: ${clientErr.message}. Operating in Local Storage mode.`;
    }
  }
}

/**
 * Get current storage provider status and metadata
 */
function getStorageStatus() {
  const activeMode = (configuredProvider === 's3' && isS3Available) ? 's3' : 'local';
  return {
    provider: activeMode,
    configuredProvider: configuredProvider,
    isS3Available: isS3Available,
    bucketName: bucketName || null,
    region: awsRegion,
    statusMessage: s3InitMessage,
    storageLabel: activeMode === 's3' 
      ? `Amazon S3 Cloud Bucket (${bucketName})` 
      : 'Local Server Storage (/uploads)'
  };
}

/**
 * Sanitize filename to prevent directory traversal and special character issues
 */
function sanitizeFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const rawBase = path.basename(originalName, ext);
  // Remove non-alphanumeric chars except dash and underscore
  const safeBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return {
    safeFileName: `${safeBase || 'doc'}-${uniqueSuffix}${ext}`,
    cleanExt: ext
  };
}

/**
 * Validate file buffer, type, and size
 */
function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided. Please choose a document to upload.' };
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension (${ext || 'unknown'}). Allowed formats: PDF, JPG, JPEG, PNG, WEBP.`
    };
  }

  if (file.mimetype && !ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file content type (${file.mimetype}). Allowed MIME types: application/pdf, image/jpeg, image/png, image/webp.`
    };
  }

  const size = file.size !== undefined ? file.size : (file.buffer ? file.buffer.length : 0);
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5 MB limit (Current size: ${(size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller file.`
    };
  }

  if (size === 0) {
    return { valid: false, error: 'The selected file is empty (0 bytes).' };
  }

  return { valid: true };
}

/**
 * Upload a document to active storage (Amazon S3 or Local disk)
 */
async function uploadDocument({ buffer, originalName, mimeType, userId, category }) {
  const { safeFileName, cleanExt } = sanitizeFileName(originalName);
  const activeMode = (configuredProvider === 's3' && isS3Available) ? 's3' : 'local';

  if (activeMode === 's3') {
    // S3 Object Key: documents/{userId}/{filename}
    // Using user-scoped prefix ensures clean data organization and safe IAM policies
    const s3Key = `documents/${userId}/${safeFileName}`;

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: buffer,
      ContentType: mimeType || 'application/octet-stream',
      Metadata: {
        userid: String(userId),
        category: String(category || 'General'),
        originalname: encodeURIComponent(originalName)
      }
    });

    try {
      await s3Client.send(putCommand);

      return {
        storageProvider: 's3',
        fileName: safeFileName,
        s3Key: s3Key,
        filePath: `s3://${bucketName}/${s3Key}`,
        fileSize: buffer.length,
        fileType: cleanExt.replace('.', '').toUpperCase(),
        mimeType: mimeType || 'application/octet-stream',
        storageNote: `Stored privately in Amazon S3 bucket "${bucketName}" (${awsRegion})`
      };
    } catch (s3Error) {
      console.error('[Storage S3 Upload Error]:', s3Error);
      let errorMsg = 'Failed to upload document to Amazon S3.';

      if (s3Error.name === 'NoSuchBucket') {
        errorMsg = `AWS S3 Bucket "${bucketName}" was not found. Please verify S3_BUCKET_NAME in .env.`;
      } else if (s3Error.name === 'AccessDenied' || s3Error.$metadata?.httpStatusCode === 403) {
        errorMsg = `Access Denied to S3 bucket "${bucketName}". Please check AWS IAM permissions (s3:PutObject).`;
      } else if (s3Error.name === 'CredentialsProviderError' || s3Error.message?.includes('credentials')) {
        errorMsg = 'AWS credentials could not be loaded. Please configure AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY in .env or run `aws configure`.';
      } else if (s3Error.message) {
        errorMsg = `AWS S3 Upload Error: ${s3Error.message}`;
      }

      const err = new Error(errorMsg);
      err.originalError = s3Error;
      throw err;
    }
  } else {
    // Local Disk Storage
    const diskPath = path.join(UPLOADS_DIR, safeFileName);
    await fs.promises.writeFile(diskPath, buffer);

    return {
      storageProvider: 'local',
      fileName: safeFileName,
      s3Key: '',
      filePath: `/uploads/${safeFileName}`,
      fileSize: buffer.length,
      fileType: cleanExt.replace('.', '').toUpperCase(),
      mimeType: mimeType || 'application/octet-stream',
      storageNote: 'Stored locally on server in /uploads directory'
    };
  }
}

/**
 * Generate secure download information:
 *  - S3: Creates short-lived (15 minutes) Presigned URL
 *  - Local: Returns local file path
 */
async function getDownloadInfo(doc) {
  if (doc.storageProvider === 's3' && isS3Available) {
    const s3Key = doc.s3Key || doc.fileName;
    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(doc.originalName || 'document')}"`
    });

    try {
      // Generate a presigned URL valid for 15 minutes (900 seconds)
      const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 900 });
      return {
        downloadUrl: presignedUrl,
        isPresigned: true,
        expiresInSeconds: 900,
        storageProvider: 's3'
      };
    } catch (presignErr) {
      console.error('[Storage Presign Error]:', presignErr);
      throw new Error(`Failed to generate secure presigned URL from Amazon S3: ${presignErr.message}`);
    }
  }

  // Local Storage Download Info
  const localDiskPath = path.join(UPLOADS_DIR, doc.fileName);
  return {
    downloadUrl: `/api/documents/${doc._id || doc.id}/download`,
    localDiskPath: localDiskPath,
    isPresigned: false,
    storageProvider: 'local'
  };
}

/**
 * Delete a document from active storage
 */
async function deleteDocumentFile(doc) {
  if (doc.storageProvider === 's3' && isS3Available) {
    const s3Key = doc.s3Key || doc.fileName;
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key
    });

    try {
      await s3Client.send(deleteCommand);
      return { success: true, message: 'Deleted from Amazon S3 bucket' };
    } catch (s3DelErr) {
      console.warn('[Storage S3 Delete Warning]:', s3DelErr.message);
      // Non-fatal warning on delete if already missing
      return { success: false, warning: s3DelErr.message };
    }
  }

  // Local Storage Deletion
  const diskPath = path.join(UPLOADS_DIR, doc.fileName);
  if (fs.existsSync(diskPath)) {
    try {
      await fs.promises.unlink(diskPath);
      return { success: true, message: 'Deleted from local uploads folder' };
    } catch (unlinkErr) {
      console.warn('[Storage Local Delete Warning]:', unlinkErr.message);
      return { success: false, warning: unlinkErr.message };
    }
  }

  return { success: true };
}

module.exports = {
  getStorageStatus,
  validateFile,
  uploadDocument,
  getDownloadInfo,
  deleteDocumentFile,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  UPLOADS_DIR
};
