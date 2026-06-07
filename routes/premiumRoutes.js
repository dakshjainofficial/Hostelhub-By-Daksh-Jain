const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  activateTrustedBadge,
  boostListing,
  activateFeaturedSeller,
  upgradePlan,
  getPricing,
  getPremiumStatus,
} = require("../controllers/premiumController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

// GET  /api/premium/pricing
router.get("/pricing", getPricing);

// GET  /api/premium/status
router.get("/status", protect, getPremiumStatus);

// POST /api/premium/trusted-badge
router.post("/trusted-badge", protect, activateTrustedBadge);

// POST /api/premium/boost/:productId
router.post(
  "/boost/:productId",
  protect,
  [body("duration").optional().isIn(["3days", "7days", "15days"])],
  validate,
  boostListing
);

// POST /api/premium/featured-seller
router.post("/featured-seller", protect, activateFeaturedSeller);

// POST /api/premium/upgrade
router.post(
  "/upgrade",
  protect,
  [body("plan").isIn(["premium", "business"]).withMessage("Plan must be premium or business")],
  validate,
  upgradePlan
);

module.exports = router;
