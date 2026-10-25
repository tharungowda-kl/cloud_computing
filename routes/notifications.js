const express = require('express');
const router = express.Router();
const { db } = require('../models/dbAdapter');
const { optionalAuth, verifyToken, requireAdmin } = require('../middleware/auth');

// Get all notifications with read status for current user
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category } = req.query;
    let notifs = await db.notifications.find();

    if (category && category !== 'All') {
      notifs = notifs.filter(n => n.category && n.category.toLowerCase() === category.toLowerCase());
    }

    const currentUserId = req.user ? req.user.id : null;

    const formatted = notifs.map(n => {
      const readList = Array.isArray(n.readBy) ? n.readBy : [];
      const isRead = currentUserId ? readList.includes(currentUserId) : false;
      return {
        ...n,
        isRead
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      unreadCount: formatted.filter(n => !n.isRead).length,
      data: formatted
    });
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications.'
    });
  }
});

// Mark single notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const notif = await db.notifications.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    const readList = Array.isArray(notif.readBy) ? [...notif.readBy] : [];
    if (!readList.includes(req.user.id)) {
      readList.push(req.user.id);
      await db.notifications.findByIdAndUpdate(req.params.id, { readBy: readList });
    }

    res.json({
      success: true,
      message: 'Notification marked as read.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update notification status.'
    });
  }
});

// Mark all notifications as read for current user
router.post('/mark-all-read', verifyToken, async (req, res) => {
  try {
    const notifs = await db.notifications.find();
    for (const notif of notifs) {
      const readList = Array.isArray(notif.readBy) ? [...notif.readBy] : [];
      if (!readList.includes(req.user.id)) {
        readList.push(req.user.id);
        await db.notifications.findByIdAndUpdate(notif._id || notif.id, { readBy: readList });
      }
    }

    res.json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read.'
    });
  }
});

// Admin: Broadcast new notification
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, message, category, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required.'
      });
    }

    const newNotif = await db.notifications.create({
      title: title.trim(),
      message: message.trim(),
      category: category || 'General',
      priority: priority || 'Normal',
      readBy: [],
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Announcement broadcasted successfully.',
      data: newNotif
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create notification.'
    });
  }
});

// Admin: Delete notification
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await db.notifications.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }
    res.json({
      success: true,
      message: 'Notification removed successfully.'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification.'
    });
  }
});

module.exports = router;
