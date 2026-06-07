const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

// GET    /api/notifications
router.get("/", protect, getNotifications);

// GET    /api/notifications/unread-count
router.get("/unread-count", protect, getUnreadCount);

// PUT    /api/notifications/read-all
router.put("/read-all", protect, markAllAsRead);

// PUT    /api/notifications/:id/read
router.put("/:id/read", protect, markAsRead);

// DELETE /api/notifications
router.delete("/", protect, clearAllNotifications);

// DELETE /api/notifications/:id
router.delete("/:id", protect, deleteNotification);

module.exports = router;
