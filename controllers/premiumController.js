const User = require("../models/User");
const Product = require("../models/Product");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const { createNotification } = require("../utils/notificationHelper");

// Pricing (in INR paise for easy extension to payment gateway)
const PRICING = {
  trustedBadge: { monthly: 149 },
  boostListing: { "3days": 99, "7days": 179, "15days": 299 },
  featuredSeller: { monthly: 299 },
  plans: {
    premium: { monthly: 199 },
    business: { monthly: 499 },
  },
};

// Helper: days to milliseconds
const daysToMs = (days) => days * 24 * 60 * 60 * 1000;

// @desc    Activate Trusted Seller badge
// @route   POST /api/premium/trusted-badge
// @access  Private
const activateTrustedBadge = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.trustedSeller && user.trustedSellerExpiry > new Date()) {
      return errorResponse(res, 409, "Trusted badge is already active.");
    }

    const expiry = new Date(Date.now() + daysToMs(30));
    await User.findByIdAndUpdate(user._id, {
      trustedSeller: true,
      trustedSellerExpiry: expiry,
    });

    const io = req.app.get("io");
    await createNotification({
      userId: user._id,
      title: "Trusted Seller Badge Activated",
      message: "Your Trusted Seller badge is now active for 30 days.",
      type: "premium",
      io,
    });

    return successResponse(res, 200, "Trusted Seller badge activated.", {
      trustedSeller: true,
      trustedSellerExpiry: expiry,
      price: PRICING.trustedBadge.monthly,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Boost a product listing
// @route   POST /api/premium/boost/:productId
// @access  Private
const boostListing = async (req, res, next) => {
  try {
    const { duration = "3days" } = req.body; // "3days" | "7days" | "15days"
    const durationMap = { "3days": 3, "7days": 7, "15days": 15 };
    const days = durationMap[duration];

    if (!days) {
      return errorResponse(res, 400, "Invalid duration. Choose: 3days, 7days, or 15days.");
    }

    const product = await Product.findById(req.params.productId);
    if (!product) return errorResponse(res, 404, "Product not found.");

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "You can only boost your own listings.");
    }

    if (product.status !== "active") {
      return errorResponse(res, 400, "Only active listings can be boosted.");
    }

    const expiry = new Date(Date.now() + daysToMs(days));
    product.boosted = true;
    product.boostExpiry = expiry;
    await product.save();

    const io = req.app.get("io");
    await createNotification({
      userId: req.user._id,
      title: "Listing Boosted!",
      message: `"${product.title}" is now boosted for ${days} days.`,
      type: "premium",
      relatedId: product._id,
      io,
    });

    return successResponse(res, 200, "Listing boosted successfully.", {
      boosted: true,
      boostExpiry: expiry,
      price: PRICING.boostListing[duration],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate Featured Seller (Profile Boost)
// @route   POST /api/premium/featured-seller
// @access  Private
const activateFeaturedSeller = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.featuredSeller && user.featuredSellerExpiry > new Date()) {
      return errorResponse(res, 409, "Featured Seller is already active.");
    }

    const expiry = new Date(Date.now() + daysToMs(30));
    await User.findByIdAndUpdate(user._id, {
      featuredSeller: true,
      featuredSellerExpiry: expiry,
    });

    const io = req.app.get("io");
    await createNotification({
      userId: user._id,
      title: "Featured Seller Activated",
      message: "You are now a Featured Seller for 30 days. You'll appear on the homepage.",
      type: "premium",
      io,
    });

    return successResponse(res, 200, "Featured Seller activated.", {
      featuredSeller: true,
      featuredSellerExpiry: expiry,
      price: PRICING.featuredSeller.monthly,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upgrade user plan
// @route   POST /api/premium/upgrade
// @access  Private
const upgradePlan = async (req, res, next) => {
  try {
    const { plan } = req.body; // "premium" | "business"

    if (!["premium", "business"].includes(plan)) {
      return errorResponse(res, 400, "Invalid plan. Choose: premium or business.");
    }

    if (req.user.plan === plan && req.user.planExpiry > new Date()) {
      return errorResponse(res, 409, `You are already on the ${plan} plan.`);
    }

    const expiry = new Date(Date.now() + daysToMs(30));
    const updateData = { plan, planExpiry: expiry };

    // Business plan includes trusted badge
    if (plan === "business") {
      updateData.trustedSeller = true;
      updateData.trustedSellerExpiry = expiry;
    }

    await User.findByIdAndUpdate(req.user._id, updateData);

    const io = req.app.get("io");
    await createNotification({
      userId: req.user._id,
      title: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Activated`,
      message: `Welcome to ${plan}! Your plan is active for 30 days.`,
      type: "premium",
      io,
    });

    return successResponse(res, 200, `Upgraded to ${plan} plan.`, {
      plan,
      planExpiry: expiry,
      price: PRICING.plans[plan].monthly,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pricing info
// @route   GET /api/premium/pricing
// @access  Public
const getPricing = async (req, res, next) => {
  try {
    return successResponse(res, 200, "Pricing fetched.", { pricing: PRICING });
  } catch (error) {
    next(error);
  }
};

// @desc    Get premium status for current user
// @route   GET /api/premium/status
// @access  Private
const getPremiumStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select(
      "plan planExpiry trustedSeller trustedSellerExpiry featuredSeller featuredSellerExpiry"
    );

    const now = new Date();
    return successResponse(res, 200, "Premium status fetched.", {
      plan: user.plan,
      planActive: user.plan !== "basic" && user.planExpiry > now,
      planExpiry: user.planExpiry,
      trustedSeller: user.trustedSeller && user.trustedSellerExpiry > now,
      trustedSellerExpiry: user.trustedSellerExpiry,
      featuredSeller: user.featuredSeller && user.featuredSellerExpiry > now,
      featuredSellerExpiry: user.featuredSellerExpiry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  activateTrustedBadge,
  boostListing,
  activateFeaturedSeller,
  upgradePlan,
  getPricing,
  getPremiumStatus,
};
