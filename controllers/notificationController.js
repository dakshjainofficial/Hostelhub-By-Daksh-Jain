const Notification = require("../models/Notification");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/apiResponse");

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const filter = { userId: req.user._id };
    if (unreadOnly === "true") filter.read = false;

    const total = await Notification.countDocuments(filter);
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, notifications, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });
    return successResponse(res, 200, "Unread count fetched.", { unreadCount: count });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) return errorResponse(res, 404, "Notification not found.");

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return successResponse(res, 200, "Notification marked as read.");
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );
    return successResponse(res, 200, "All notifications marked as read.");
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) return errorResponse(res, 404, "Notification not found.");

    return successResponse(res, 200, "Notification deleted.");
  } catch (error) {
    next(error);
  }
};

// @desc    Delete all notifications for current user
// @route   DELETE /api/notifications
// @access  Private
const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    return successResponse(res, 200, "All notifications cleared.");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
