const express = require('express');
const router = express.Router();
const { db, isMongoConnected } = require('../models/dbAdapter');
const { requireAdmin } = require('../middleware/auth');

// Get overview analytics and counts
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await db.users.countDocuments();
    const totalSchemes = await db.schemes.countDocuments();
    const totalScholarships = await db.scholarships.countDocuments();
    const totalAgri = await db.agriculture.countDocuments();
    const totalDocs = await db.documents.countDocuments();
    const totalNotifs = await db.notifications.countDocuments();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSchemes,
        totalScholarships,
        totalAgri,
        totalDocs,
        totalNotifs,
        databaseMode: isMongoConnected() ? 'MongoDB (Native Database)' : 'Local JSON Store (Portable Demonstration Mode)',
        serverTime: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to aggregate administrative statistics.'
    });
  }
});

// List all registered users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await db.users.find();
    // Exclude password hashes
    const sanitized = users.map(u => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      district: u.district,
      role: u.role,
      createdAt: u.createdAt
    }));

    res.json({
      success: true,
      count: sanitized.length,
      data: sanitized
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user registry.'
    });
  }
});

// Delete user account
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own active administrator account.'
      });
    }

    const removed = await db.users.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    res.json({
      success: true,
      message: 'User account deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user account.'
    });
  }
});

module.exports = router;
