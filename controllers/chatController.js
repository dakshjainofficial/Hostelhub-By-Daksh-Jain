const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const Product = require("../models/Product");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/apiResponse");

// @desc    Get or create a conversation between two users (optionally about a product)
// @route   POST /api/conversations
// @access  Private
const getOrCreateConversation = async (req, res, next) => {
  try {
    const { receiverId, productId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return errorResponse(res, 400, "You cannot start a conversation with yourself.");
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return errorResponse(res, 404, "User not found.");

    // College isolation
    if (receiver.college !== req.user.college) {
      return errorResponse(res, 403, "You can only chat with students from your college.");
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      ...(productId && { productId }),
    }).populate("participants", "name profileImage hostel verifiedSeller")
      .populate("productId", "title price images status");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        productId: productId || null,
      });
      await conversation.populate("participants", "name profileImage hostel verifiedSeller");
      if (productId) await conversation.populate("productId", "title price images status");
    }

    return successResponse(res, 200, "Conversation ready.", { conversation });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name profileImage hostel verifiedSeller isActive")
      .populate("productId", "title price images status");

    // Attach unread count for current user
    const result = conversations.map((conv) => {
      const obj = conv.toObject();
      obj.unreadCount = conv.unreadCount?.get(req.user._id.toString()) || 0;
      // Remove current user from participants to show "other" person
      obj.otherParticipant = obj.participants.find(
        (p) => p._id.toString() !== req.user._id.toString()
      );
      return obj;
    });

    return successResponse(res, 200, "Conversations fetched.", { conversations: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 30 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return errorResponse(res, 404, "Conversation not found.");

    // Auth check: user must be a participant
    if (!conversation.participants.map((p) => p.toString()).includes(req.user._id.toString())) {
      return errorResponse(res, 403, "You are not part of this conversation.");
    }

    const total = await Message.countDocuments({ conversationId });
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("senderId", "name profileImage");

    // Reverse so oldest messages come first
    messages.reverse();

    // Mark unread messages as read
    await Message.updateMany(
      { conversationId, receiverId: req.user._id, read: false },
      { read: true, readAt: new Date() }
    );

    // Reset unread count for this user in this conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${req.user._id}`]: 0 },
    });

    return paginatedResponse(res, messages, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, receiverId, text } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return errorResponse(res, 404, "Conversation not found.");

    if (!conversation.participants.map((p) => p.toString()).includes(req.user._id.toString())) {
      return errorResponse(res, 403, "Not authorized.");
    }

    if (!text || !text.trim()) {
      return errorResponse(res, 400, "Message text is required.");
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId,
      conversationId,
      text: text.trim(),
    });

    await message.populate("senderId", "name profileImage");

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text.trim().substring(0, 100),
      lastMessageAt: new Date(),
      $inc: { [`unreadCount.${receiverId}`]: 1 },
    });

    // Increment sender's chat count for analytics
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalChats: 1 } });

    // Emit via socket (handled in socket/index.js — this is the HTTP fallback)
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${receiverId}`).emit("newMessage", message);
      io.to(`conversation_${conversationId}`).emit("newMessage", message);
    }

    return successResponse(res, 201, "Message sent.", { message });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message (soft delete)
// @route   DELETE /api/messages/:messageId
// @access  Private (sender only)
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return errorResponse(res, 404, "Message not found.");

    if (message.senderId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "You can only delete your own messages.");
    }

    await message.deleteOne();

    return successResponse(res, 200, "Message deleted.");
  } catch (error) {
    next(error);
  }
};

// @desc    Get total unread message count
// @route   GET /api/conversations/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      read: false,
    });
    return successResponse(res, 200, "Unread count fetched.", { unreadCount: count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  getUnreadCount,
};
