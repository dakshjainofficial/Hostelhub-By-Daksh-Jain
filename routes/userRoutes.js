const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getProfile,
  updateProfile,
  updateProfileImage,
  getUserById,
  saveProduct,
  removeSavedProduct,
  getSavedProducts,
  getMyListings,
  getAnalytics,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

// Profile
router.get("/profile", protect, getProfile);
router.put(
  "/profile",
  protect,
  [
    body("name").optional().trim().isLength({ min: 2, max: 50 }),
    body("hostel").optional().isString(),
  ],
  validate,
  updateProfile
);
router.put("/profile/image", protect, updateProfileImage);

// Analytics (premium)
router.get("/analytics", protect, getAnalytics);

// My listings
router.get("/my-listings", protect, getMyListings);

// Public profile by ID (must come after specific named routes)
router.get("/:id", protect, getUserById);

module.exports = router;
