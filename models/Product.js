const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Books", "Electronics", "Furniture", "Cycles", "Essentials", "Clothing", "Sports", "Other"],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    college: {
      type: String,
      required: [true, "College is required"],
    },
    hostel: {
      type: String,
      default: "",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
      default: "Good",
    },
    boosted: {
      type: Boolean,
      default: false,
    },
    boostExpiry: {
      type: Date,
      default: null,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    interestedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "sold", "inactive"],
      default: "active",
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
productSchema.index({ college: 1, status: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ boosted: -1, createdAt: -1 });
productSchema.index({ title: "text", description: "text" });

// Auto-remove boost when expired
productSchema.methods.checkBoostExpiry = function () {
  if (this.boosted && this.boostExpiry && new Date() > this.boostExpiry) {
    this.boosted = false;
    this.boostExpiry = null;
  }
};

module.exports = mongoose.model("Product", productSchema);
