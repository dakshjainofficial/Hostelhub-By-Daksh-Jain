const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// At least text or image required
messageSchema.pre("save", function (next) {
  if (!this.text && !this.imageUrl) {
    return next(new Error("Message must have text or an image"));
  }
  next();
});

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });

module.exports = mongoose.model("Message", messageSchema);
