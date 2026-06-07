const { verifyToken } = require("../config/jwt");
const User = require("../models/User");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// Track online users: userId -> socketId
const onlineUsers = new Map();

const initSocket = (io) => {
  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) return next(new Error("Authentication token required."));

      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select("-password");

      if (!user || !user.isActive) return next(new Error("Unauthorized."));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token."));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Socket connected: ${socket.user.name} (${userId})`);

    // Register user in online map and join personal room
    onlineUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);

    // Broadcast updated online users list to all
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));

    // ─── Join a conversation room ───────────────────────────────────────────
    socket.on("joinConversation", async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants
          .map((p) => p.toString())
          .includes(userId);

        if (!isParticipant) return;

        socket.join(`conversation_${conversationId}`);
        console.log(`💬 ${socket.user.name} joined conversation ${conversationId}`);
      } catch (err) {
        console.error("joinConversation error:", err.message);
      }
    });

    // ─── Leave a conversation room ──────────────────────────────────────────
    socket.on("leaveConversation", ({ conversationId }) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // ─── Send message via socket ────────────────────────────────────────────
    socket.on("sendMessage", async ({ conversationId, receiverId, text }, callback) => {
      try {
        if (!text || !text.trim()) {
          return callback?.({ success: false, message: "Message cannot be empty." });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return callback?.({ success: false, message: "Conversation not found." });
        }

        const isParticipant = conversation.participants
          .map((p) => p.toString())
          .includes(userId);

        if (!isParticipant) {
          return callback?.({ success: false, message: "Not authorized." });
        }

        // Save message to DB
        const message = await Message.create({
          senderId: userId,
          receiverId,
          conversationId,
          text: text.trim(),
        });

        await message.populate("senderId", "name profileImage");

        // Update conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text.trim().substring(0, 100),
          lastMessageAt: new Date(),
          $inc: { [`unreadCount.${receiverId}`]: 1 },
        });

        // Emit to conversation room (both participants if joined)
        io.to(`conversation_${conversationId}`).emit("newMessage", message);

        // Also emit directly to receiver's personal room (for notification badge)
        io.to(`user_${receiverId}`).emit("newMessage", message);

        // Update sender's chat analytics
        await User.findByIdAndUpdate(userId, { $inc: { totalChats: 1 } });

        callback?.({ success: true, message });
      } catch (err) {
        console.error("sendMessage socket error:", err.message);
        callback?.({ success: false, message: "Failed to send message." });
      }
    });

    // ─── Typing indicator ───────────────────────────────────────────────────
    socket.on("typing", ({ conversationId, receiverId }) => {
      socket.to(`user_${receiverId}`).emit("typing", {
        conversationId,
        senderId: userId,
        senderName: socket.user.name,
      });
    });

    socket.on("stopTyping", ({ conversationId, receiverId }) => {
      socket.to(`user_${receiverId}`).emit("stopTyping", {
        conversationId,
        senderId: userId,
      });
    });

    // ─── Mark messages as read ──────────────────────────────────────────────
    socket.on("markRead", async ({ conversationId, senderId }) => {
      try {
        await Message.updateMany(
          { conversationId, receiverId: userId, senderId, read: false },
          { read: true, readAt: new Date() }
        );

        await Conversation.findByIdAndUpdate(conversationId, {
          $set: { [`unreadCount.${userId}`]: 0 },
        });

        // Notify sender their messages were read
        io.to(`user_${senderId}`).emit("messagesRead", { conversationId, readBy: userId });
      } catch (err) {
        console.error("markRead socket error:", err.message);
      }
    });

    // ─── Disconnect ─────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name} (${userId})`);
      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
};

// Helper to check if a user is online (used by controllers)
const isUserOnline = (userId) => onlineUsers.has(userId.toString());

module.exports = { initSocket, isUserOnline };
