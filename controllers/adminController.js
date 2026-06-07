const User = require("../models/User");
const Product = require("../models/Product");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Admin = require("../models/Admin");
const { generateToken } = require("../config/jwt");
const { deleteFromCloudinary } = require("../config/cloudinary");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/apiResponse");
const { createNotification } = require("../utils/notificationHelper");

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+password");
    if (!admin) return errorResponse(res, 401, "Invalid admin credentials.");

    if (!admin.isActive) return errorResponse(res, 403, "Admin account is deactivated.");

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return errorResponse(res, 401, "Invalid admin credentials.");

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken({ id: admin._id, isAdmin: true, role: admin.role });

    return successResponse(res, 200, "Admin login successful.", {
      token,
      admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Admin
const getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalListings,
      activeListings,
      totalMessages,
      reportedListings,
      premiumUsers,
      recentUsers,
      recentListings,
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ status: "active" }),
      Message.countDocuments(),
      Product.countDocuments({ isReported: true }),
      User.countDocuments({ plan: { $ne: "basic" } }),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email college plan createdAt"),
      Product.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("sellerId", "name college")
        .select("title price category college status createdAt"),
    ]);

    // College breakdown
    const collegeBreakdown = await User.aggregate([
      { $group: { _id: "$college", userCount: { $sum: 1 } } },
      { $sort: { userCount: -1 } },
      { $limit: 10 },
    ]);

    return successResponse(res, 200, "Dashboard stats fetched.", {
      stats: {
        totalUsers,
        totalListings,
        activeListings,
        totalMessages,
        reportedListings,
        premiumUsers,
      },
      recentUsers,
      recentListings,
      collegeBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (paginated, searchable)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, college, plan, isActive } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (college) filter.college = college;
    if (plan) filter.plan = plan;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select("-password");

    return paginatedResponse(res, users, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Admin
const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return errorResponse(res, 404, "User not found.");

    const listings = await Product.find({ sellerId: user._id }).sort({ createdAt: -1 });

    return successResponse(res, 200, "User details fetched.", { user, listings });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate / activate a user
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, "User not found.");

    user.isActive = !user.isActive;
    await user.save();

    const status = user.isActive ? "activated" : "deactivated";

    const io = req.app.get("io");
    await createNotification({
      userId: user._id,
      title: `Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your HostelHub account has been ${status} by admin.`,
      type: "system",
      io,
    });

    return successResponse(res, 200, `User ${status}.`, { isActive: user.isActive });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user and their data
// @route   DELETE /api/admin/users/:id
// @access  Admin (superadmin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 404, "User not found.");

    // Delete user's product images from Cloudinary
    const products = await Product.find({ sellerId: user._id });
    for (const product of products) {
      await Promise.all(product.images.map((img) => deleteFromCloudinary(img.publicId)));
    }
    await Product.deleteMany({ sellerId: user._id });

    // Delete profile image
    if (user.profileImage?.publicId) {
      await deleteFromCloudinary(user.profileImage.publicId);
    }

    await Conversation.deleteMany({ participants: user._id });
    await Message.deleteMany({ $or: [{ senderId: user._id }, { receiverId: user._id }] });
    await user.deleteOne();

    return successResponse(res, 200, "User and all associated data deleted.");
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings (paginated, filterable)
// @route   GET /api/admin/listings
// @access  Admin
const getAllListings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      college,
      category,
      status,
      isReported,
    } = req.query;

    const filter = {};
    if (college) filter.college = college;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (isReported === "true") filter.isReported = true;
    if (search) filter.$text = { $search: search };

    const total = await Product.countDocuments(filter);
    const listings = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("sellerId", "name email college");

    return paginatedResponse(res, listings, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a listing
// @route   DELETE /api/admin/listings/:id
// @access  Admin
const deleteListing = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 404, "Listing not found.");

    await Promise.all(product.images.map((img) => deleteFromCloudinary(img.publicId)));

    const io = req.app.get("io");
    await createNotification({
      userId: product.sellerId,
      title: "Listing Removed",
      message: `Your listing "${product.title}" was removed by admin for violating community guidelines.`,
      type: "system",
      io,
    });

    await product.deleteOne();

    return successResponse(res, 200, "Listing deleted.");
  } catch (error) {
    next(error);
  }
};

// @desc    Clear report flag on a listing
// @route   PUT /api/admin/listings/:id/clear-report
// @access  Admin
const clearListingReport = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isReported: false, reportCount: 0 },
      { new: true }
    );
    if (!product) return errorResponse(res, 404, "Listing not found.");

    return successResponse(res, 200, "Report cleared.", { product });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually grant premium feature to user
// @route   PUT /api/admin/users/:id/grant-premium
// @access  Admin
const grantPremium = async (req, res, next) => {
  try {
    const { plan, days = 30 } = req.body;
    if (!["premium", "business"].includes(plan)) {
      return errorResponse(res, 400, "Invalid plan.");
    }

    const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { plan, planExpiry: expiry, ...(plan === "business" && { trustedSeller: true, trustedSellerExpiry: expiry }) },
      { new: true }
    );

    if (!user) return errorResponse(res, 404, "User not found.");

    const io = req.app.get("io");
    await createNotification({
      userId: user._id,
      title: "Premium Granted",
      message: `Admin has granted you a ${plan} plan for ${days} days.`,
      type: "premium",
      io,
    });

    return successResponse(res, 200, `${plan} plan granted to ${user.name}.`);
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of colleges on platform
// @route   GET /api/admin/colleges
// @access  Admin
const getColleges = async (req, res, next) => {
  try {
    const colleges = await User.aggregate([
      { $group: { _id: "$college", users: { $sum: 1 }, listings: { $sum: 0 } } },
      { $sort: { users: -1 } },
    ]);

    return successResponse(res, 200, "Colleges fetched.", { colleges });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  getDashboard,
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  deleteUser,
  getAllListings,
  deleteListing,
  clearListingReport,
  grantPremium,
  getColleges,
};
