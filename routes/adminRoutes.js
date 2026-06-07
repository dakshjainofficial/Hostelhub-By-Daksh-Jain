const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
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
} = require("../controllers/adminController");
const { adminProtect, superAdminOnly } = require("../middleware/adminMiddleware");
const validate = require("../middleware/validate");

// POST /api/admin/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  adminLogin
);

// All routes below require admin auth
router.use(adminProtect);

// Dashboard
router.get("/dashboard", getDashboard);

// Colleges
router.get("/colleges", getColleges);

// Users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id/toggle-status", toggleUserStatus);
router.put(
  "/users/:id/grant-premium",
  [
    body("plan").isIn(["premium", "business"]).withMessage("Invalid plan"),
    body("days").optional().isInt({ min: 1, max: 365 }),
  ],
  validate,
  grantPremium
);
router.delete("/users/:id", superAdminOnly, deleteUser);

// Listings
router.get("/listings", getAllListings);
router.delete("/listings/:id", deleteListing);
router.put("/listings/:id/clear-report", clearListingReport);

module.exports = router;
