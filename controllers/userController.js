const User = require("../models/User");
const Product = require("../models/Product");
const { uploadProfileImage } = require("../config/cloudinary");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/apiResponse");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("savedItems", "title price images status");
    return successResponse(res, 200, "Profile fetched.", { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, hostel } = req.body;
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (hostel !== undefined) updateData.hostel = hostel.trim();

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, "Profile updated.", { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile image
// @route   PUT /api/users/profile/image
// @access  Private
const updateProfileImage = (req, res, next) => {
  uploadProfileImage(req, res, async (err) => {
    if (err) {
      return errorResponse(res, 400, err.message);
    }
    try {
      if (!req.file) {
        return errorResponse(res, 400, "No image file provided.");
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          profileImage: {
            url: req.file.path,
            publicId: req.file.filename,
          },
        },
        { new: true }
      );

      return successResponse(res, 200, "Profile image updated.", {
        profileImage: user.profileImage,
      });
    } catch (error) {
      next(error);
    }
  });
};

// @desc    Get public user profile by ID
// @route   GET /api/users/:id
// @access  Private (same college)
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name college hostel profileImage verifiedSeller trustedSeller featuredSeller plan createdAt"
    );

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    // College isolation: only show users from same college
    if (user.college !== req.user.college) {
      return errorResponse(res, 403, "You can only view profiles from your college.");
    }

    // Get user's listings count
    const listingsCount = await Product.countDocuments({
      sellerId: user._id,
      status: "active",
    });

    return successResponse(res, 200, "User profile fetched.", {
      user,
      listingsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save a product
// @route   POST /api/saved/:productId
// @access  Private
const saveProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return errorResponse(res, 404, "Product not found.");
    }

    // College check
    if (product.college !== req.user.college) {
      return errorResponse(res, 403, "You can only save products from your college.");
    }

    const user = await User.findById(req.user._id);
    if (user.savedItems.includes(productId)) {
      return errorResponse(res, 409, "Product already saved.");
    }

    user.savedItems.push(productId);
    await user.save();

    return successResponse(res, 200, "Product saved.", { savedItems: user.savedItems });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove saved product
// @route   DELETE /api/saved/:productId
// @access  Private
const removeSavedProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedItems: productId },
    });

    return successResponse(res, 200, "Product removed from saved items.");
  } catch (error) {
    next(error);
  }
};

// @desc    Get saved products
// @route   GET /api/saved
// @access  Private
const getSavedProducts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedItems",
      match: { status: "active" },
      select: "title price images category college hostel sellerId status createdAt boosted",
      populate: { path: "sellerId", select: "name hostel verifiedSeller" },
    });

    return successResponse(res, 200, "Saved products fetched.", {
      savedItems: user.savedItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own listings
// @route   GET /api/users/my-listings
// @access  Private
const getMyListings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { sellerId: req.user._id };
    if (status) filter.status = status;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, products, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// @desc    Get seller analytics (premium feature)
// @route   GET /api/users/analytics
// @access  Private (premium users)
const getAnalytics = async (req, res, next) => {
  try {
    if (req.user.plan === "basic") {
      return errorResponse(res, 403, "Analytics is a premium feature. Upgrade your plan.");
    }

    const products = await Product.find({ sellerId: req.user._id });

    const totalViews = products.reduce((sum, p) => sum + p.views, 0);
    const totalListings = products.length;
    const activeListings = products.filter((p) => p.status === "active").length;
    const soldListings = products.filter((p) => p.status === "sold").length;

    // Top performing products
    const topProducts = [...products]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((p) => ({ _id: p._id, title: p.title, views: p.views, status: p.status }));

    return successResponse(res, 200, "Analytics fetched.", {
      totalViews,
      totalListings,
      activeListings,
      soldListings,
      topProducts,
      totalChats: req.user.totalChats,
      totalSales: req.user.totalSales,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfileImage,
  getUserById,
  saveProduct,
  removeSavedProduct,
  getSavedProducts,
  getMyListings,
  getAnalytics,
};
