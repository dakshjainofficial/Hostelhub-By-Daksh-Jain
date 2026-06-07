const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  markAsSold,
  reportProduct,
  getProductsBySeller,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { uploadProductImages } = require("../config/cloudinary");

// Multer wrapper middleware — parses multipart form so req.body is populated before validators
const parseProductImages = (req, res, next) => {
  uploadProductImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// GET  /api/products          — list (college-filtered)
router.get("/", protect, getProducts);

// POST /api/products          — create listing
// Order: auth → multer (parses form) → validators (check parsed body) → controller
router.post(
  "/",
  protect,
  parseProductImages,
  [
    body("title").trim().notEmpty().isLength({ min: 3, max: 100 }),
    body("description").trim().notEmpty().isLength({ min: 10, max: 1000 }),
    body("price").isNumeric().withMessage("Price must be a number").custom((v) => v >= 0),
    body("category")
      .isIn(["Books", "Electronics", "Furniture", "Cycles", "Essentials", "Clothing", "Sports", "Other"])
      .withMessage("Invalid category"),
    body("condition")
      .optional()
      .isIn(["New", "Like New", "Good", "Fair", "Poor"]),
  ],
  validate,
  createProduct
);

// GET /api/products/seller/:sellerId
router.get("/seller/:sellerId", protect, getProductsBySeller);

// GET    /api/products/:id
router.get("/:id", protect, getProductById);

// PUT    /api/products/:id
router.put(
  "/:id",
  protect,
  [
    body("title").optional().trim().isLength({ min: 3, max: 100 }),
    body("description").optional().trim().isLength({ min: 10, max: 1000 }),
    body("price").optional().isNumeric(),
    body("category")
      .optional()
      .isIn(["Books", "Electronics", "Furniture", "Cycles", "Essentials", "Clothing", "Sports", "Other"]),
    body("status").optional().isIn(["active", "sold", "inactive"]),
  ],
  validate,
  updateProduct
);

// DELETE /api/products/:id
router.delete("/:id", protect, deleteProduct);

// DELETE /api/products/:id/images/:publicId
router.delete("/:id/images/:publicId", protect, deleteProductImage);

// PUT    /api/products/:id/sold
router.put("/:id/sold", protect, markAsSold);

// POST   /api/products/:id/report
router.post("/:id/report", protect, reportProduct);

module.exports = router;
