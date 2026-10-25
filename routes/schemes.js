const express = require('express');
const router = express.Router();
const { db } = require('../models/dbAdapter');
const { requireAdmin } = require('../middleware/auth');

// Get all schemes (with search and category filtering)
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let schemes = await db.schemes.find();

    if (category && category !== 'All') {
      schemes = schemes.filter(s => s.category && s.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      schemes = schemes.filter(s => 
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.department && s.department.toLowerCase().includes(q)) ||
        (s.benefits && s.benefits.toLowerCase().includes(q))
      );
    }

    res.json({
      success: true,
      count: schemes.length,
      data: schemes
    });
  } catch (err) {
    console.error('Schemes fetch error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch government schemes.'
    });
  }
});

// Get single scheme by ID
router.get('/:id', async (req, res) => {
  try {
    const scheme = await db.schemes.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found.'
      });
    }
    res.json({
      success: true,
      data: scheme
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching scheme details.'
    });
  }
});

// Admin: Create new scheme
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, department, category, description, eligibility, benefits, applicationLink, deadline, documentsRequired } = req.body;

    if (!name || !department || !description || !eligibility || !benefits) {
      return res.status(400).json({
        success: false,
        message: 'Name, department, description, eligibility, and benefits are required.'
      });
    }

    const newScheme = await db.schemes.create({
      name: name.trim(),
      department: department.trim(),
      category: category || 'Agriculture',
      description: description.trim(),
      eligibility: eligibility.trim(),
      benefits: benefits.trim(),
      applicationLink: applicationLink || 'https://services.india.gov.in',
      deadline: deadline || 'Open round the year',
      documentsRequired: Array.isArray(documentsRequired) ? documentsRequired : (documentsRequired ? documentsRequired.split(',').map(d => d.trim()) : ['Aadhaar Card', 'Bank Passbook']),
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Scheme created successfully.',
      data: newScheme
    });
  } catch (err) {
    console.error('Scheme creation error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create scheme.'
    });
  }
});

// Admin: Update scheme
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await db.schemes.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found to update.'
      });
    }
    res.json({
      success: true,
      message: 'Scheme updated successfully.',
      data: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update scheme.'
    });
  }
});

// Admin: Delete scheme
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await db.schemes.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found to delete.'
      });
    }
    res.json({
      success: true,
      message: 'Scheme deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete scheme.'
    });
  }
});

module.exports = router;
