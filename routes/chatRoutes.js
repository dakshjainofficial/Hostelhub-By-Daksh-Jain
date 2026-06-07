const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  getUnreadCount,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

// Conversations
// GET  /api/conversations
router.get("/conversations", protect, getConversations);

// GET  /api/conversations/unread-count
router.get("/conversations/unread-count", protect, getUnreadCount);

// POST /api/conversations
router.post(
  "/conversations",
  protect,
  [
    body("receiverId").notEmpty().withMessage("Receiver ID is required").isMongoId(),
    body("productId").optional().isMongoId(),
  ],
  validate,
  getOrCreateConversation
);

// Messages
// GET    /api/messages/:conversationId
router.get("/messages/:conversationId", protect, getMessages);

// POST   /api/messages
router.post(
  "/messages",
  protect,
  [
    body("conversationId").notEmpty().isMongoId(),
    body("receiverId").notEmpty().isMongoId(),
    body("text").trim().notEmpty().withMessage("Message text is required").isLength({ max: 1000 }),
  ],
  validate,
  sendMessage
);

// DELETE /api/messages/:messageId
router.delete("/messages/:messageId", protect, deleteMessage);

module.exports = router;
