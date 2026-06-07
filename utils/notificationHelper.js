const Notification = require("../models/Notification");

/**
 * Create a notification for a user.
 * Also emits via socket if io is passed.
 */
const createNotification = async ({ userId, title, message, type = "system", relatedId = null, io = null }) => {
  try {
    const notification = await Notification.create({ userId, title, message, type, relatedId });

    // Emit real-time notification via socket if available
    if (io) {
      io.to(`user_${userId}`).emit("notification", {
        _id: notification._id,
        title,
        message,
        type,
        relatedId,
        read: false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    console.error("Notification creation failed:", error.message);
    return null;
  }
};

module.exports = { createNotification };
