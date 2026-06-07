const express = require("express");
const router = express.Router();
const {
  saveProduct,
  removeSavedProduct,
  getSavedProducts,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// GET    /api/saved
router.get("/", protect, getSavedProducts);

// POST   /api/saved/:productId
router.post("/:productId", protect, saveProduct);

// DELETE /api/saved/:productId
router.delete("/:productId", protect, removeSavedProduct);

module.exports = router;
