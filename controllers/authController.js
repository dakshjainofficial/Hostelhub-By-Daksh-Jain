const User = require("../models/User");
const { generateToken } = require("../config/jwt");
const { extractCollegeFromEmail } = require("../utils/collegeExtractor");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, hostel } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, "An account with this email already exists.");
    }

    // Extract college from email (core feature)
    const college = extractCollegeFromEmail(email);
    if (!college) {
      return errorResponse(
        res,
        400,
        "Please use your college email address (e.g. user@vitbhopal.ac.in)."
      );
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      college,
      hostel: hostel || "",
    });

    const token = generateToken({ id: user._id, college: user.college });

    return successResponse(res, 201, "Account created successfully.", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        hostel: user.hostel,
        profileImage: user.profileImage,
        verifiedSeller: user.verifiedSeller,
        trustedSeller: user.trustedSeller,
        plan: user.plan,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    if (!user.isActive) {
      return errorResponse(res, 403, "Your account has been deactivated. Contact support.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, "Invalid email or password.");
    }

    const token = generateToken({ id: user._id, college: user.college });

    return successResponse(res, 200, "Login successful.", {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        hostel: user.hostel,
        profileImage: user.profileImage,
        verifiedSeller: user.verifiedSeller,
        trustedSeller: user.trustedSeller,
        featuredSeller: user.featuredSeller,
        plan: user.plan,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    return successResponse(res, 200, "User fetched.", { user: req.user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 400, "Current password is incorrect.");
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, "Password changed successfully.");
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, changePassword };
