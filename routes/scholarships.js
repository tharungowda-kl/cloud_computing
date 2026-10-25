const express = require('express');
const router = express.Router();
const { db } = require('../models/dbAdapter');
const { requireAdmin } = require('../middleware/auth');

// Get all scholarships (search & category)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let scholarships = await db.scholarships.find();

    if (category && category !== 'All') {
      scholarships = scholarships.filter(s => s.category && s.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      scholarships = scholarships.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.provider && s.provider.toLowerCase().includes(q)) ||
        (s.eligibility && s.eligibility.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: scholarships.length,
      data: scholarships
    });
  } catch (err) {
    console.error('Scholarships fetch error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scholarships.'
    });
  }
});

// Get single scholarship by ID
router.get('/:id', async (req, res) => {
  try {
    const scholarship = await db.scholarships.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found.'
      });
    }
    res.json({
      success: true,
      data: scholarship
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving scholarship details.'
    });
  }
});

// Admin: Create scholarship
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, provider, category, eligibility, amount, deadline, applicationLink, description } = req.body;

    if (!name || !provider || !eligibility || !amount || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Name, provider, eligibility, amount, and deadline are required.'
      });
    }

    const newScholarship = await db.scholarships.create({
      name: name.trim(),
      provider: provider.trim(),
      category: category || 'Post-Matric',
      eligibility: eligibility.trim(),
      amount: amount.trim(),
      deadline: deadline.trim(),
      applicationLink: applicationLink || 'https://scholarships.gov.in',
      description: (description || '').trim(),
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Scholarship created successfully.',
      data: newScholarship
    });
  } catch (err) {
    console.error('Scholarship creation error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create scholarship.'
    });
  }
});

// Admin: Update scholarship
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await db.scholarships.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found to update.'
      });
    }
    res.json({
      success: true,
      message: 'Scholarship updated successfully.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update scholarship.'
    });
  }
});

// Admin: Delete scholarship
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await db.scholarships.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found to delete.'
      });
    }
    res.json({
      success: true,
      message: 'Scholarship deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete scholarship.'
    });
  }
});

module.exports = router;
