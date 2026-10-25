const express = require('express');
const router = express.Router();
const { db } = require('../models/dbAdapter');
const { requireAdmin } = require('../middleware/auth');

// Get all agriculture articles
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let articles = await db.agriculture.find();

    if (category && category !== 'All') {
      articles = articles.filter(a => a.category && a.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      articles = articles.filter(a =>
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.content && a.content.toLowerCase().includes(q)) ||
        (a.cropType && a.cropType.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (err) {
    console.error('Agri articles fetch error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve agriculture articles.'
    });
  }
});

// Get single article
router.get('/:id', async (req, res) => {
  try {
    const article = await db.agriculture.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found.'
      });
    }
    res.json({
      success: true,
      data: article
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching article details.'
    });
  }
});

// Admin: Create article
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, category, cropType, season, summary, content, tips } = req.body;

    if (!title || !summary || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, summary, and content are required.'
      });
    }

    let parsedTips = [];
    if (Array.isArray(tips)) {
      parsedTips = tips;
    } else if (typeof tips === 'string' && tips.trim()) {
      parsedTips = tips.split('\n').map(t => t.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
    }

    const newArticle = await db.agriculture.create({
      title: title.trim(),
      category: category || 'Crop Management',
      cropType: cropType || 'General',
      season: season || 'All Seasons',
      summary: summary.trim(),
      content: content.trim(),
      tips: parsedTips,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Article published successfully.',
      data: newArticle
    });
  } catch (err) {
    console.error('Agri article creation error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create article.'
    });
  }
});

// Admin: Update article
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { tips } = req.body;
    const updateData = { ...req.body };
    if (typeof tips === 'string') {
      updateData.tips = tips.split('\n').map(t => t.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
    }

    const updated = await db.agriculture.findByIdAndUpdate(req.params.id, updateData);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Article not found to update.'
      });
    }
    res.json({
      success: true,
      message: 'Article updated successfully.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update article.'
    });
  }
});

// Admin: Delete article
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await db.agriculture.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Article not found to delete.'
      });
    }
    res.json({
      success: true,
      message: 'Article deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete article.'
    });
  }
});

module.exports = router;
