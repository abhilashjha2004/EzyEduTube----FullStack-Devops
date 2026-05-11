const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notifications');

// ─── GET /api/notifications/:userId ─────────────────────────────────────────
router.get('/:userId', notificationController.getUserNotifications);

// ─── PATCH /api/notifications/:userId/read-all ───────────────────────────────
router.patch('/:userId/read-all', notificationController.markAllAsRead);

// ─── PATCH /api/notifications/single/:id/read ────────────────────────────────
router.patch('/single/:id/read', notificationController.markSingleAsRead);

module.exports = router;
