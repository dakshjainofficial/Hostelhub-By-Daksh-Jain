const Product = require("../models/Product");
const User = require("../models/User");
const { deleteFromCloudinary } = require("../config/cloudinary");
const { successResponse, errorResponse, paginatedResponse } = require("../utils/apiResponse");

// @desc    Create a new product listing
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, hostel, condition } = req.body;

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 400, "At least one product image is required.");
    }

    const images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    const product = await Product.create({
      title,
      description,
      price: Number(price),
      category,
      images,
      college: req.user.college,
      hostel: hostel || req.user.hostel,
      sellerId: req.user._id,
      condition: condition || "Good",
    });

    await product.populate("sellerId", "name hostel verifiedSeller trustedSeller profileImage");

    return successResponse(res, 201, "Product listed successfully.", { product });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products (college-filtered, with search/filter/pagination)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      condition,
      sortBy = "recent",
    } = req.query;

    // Core feature: always filter by user's college
    const filter = {
      college: req.user.college,
      status: "active",
    };

    if (category) filter.category = category;
    if (condition) filter.condition = condition;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Sort logic: boosted items always come first within sort
    let sort = {};
    switch (sortBy) {
      case "price_asc":
        sort = { boosted: -1, price: 1 };
        break;
      case "price_desc":
        sort = { boosted: -1, price: -1 };
        break;
      case "popular":
        sort = { boosted: -1, views: -1 };
        break;
      default:
        sort = { boosted: -1, createdAt: -1 };
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("sellerId", "name hostel verifiedSeller trustedSeller profileImage");

    // Auto-expire boosts silently (don't save — cron can handle persistence)
    const now = new Date();
    const cleaned = products.map((p) => {
      const obj = p.toObject();
      if (obj.boosted && obj.boostExpiry && now > obj.boostExpiry) {
        obj.boosted = false;
      }
      return obj;
    });

    return paginatedResponse(res, cleaned, total, page, limit);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "sellerId",
      "name email hostel college verifiedSeller trustedSeller featuredSeller profileImage plan createdAt"
    );

    if (!product) {
      return errorResponse(res, 404, "Product not found.");
    }

    // College isolation
    if (product.college !== req.user.college) {
      return errorResponse(res, 403, "This product is not available at your college.");
    }

    // Increment view count (don't await — non-blocking)
    Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).exec();

    // Also increment seller's total views if premium
    User.findByIdAndUpdate(product.sellerId._id, { $inc: { totalViews: 1 } }).exec();

    return successResponse(res, 200, "Product fetched.", { product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (owner only)
const updateProduct = (req, res, next) => {
  uploadProductImages(req, res, async (err) => {
    if (err) return errorResponse(res, 400, err.message);

    try {
      const product = await Product.findById(req.params.id);

      if (!product) return errorResponse(res, 404, "Product not found.");

      if (product.sellerId.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, "You can only edit your own listings.");
      }

      const { title, description, price, category, hostel, condition, status } = req.body;

      if (title) product.title = title;
      if (description) product.description = description;
      if (price !== undefined) product.price = Number(price);
      if (category) product.category = category;
      if (hostel !== undefined) product.hostel = hostel;
      if (condition) product.condition = condition;
      if (status) product.status = status;

      // Append new images if uploaded
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => ({
          url: file.path,
          publicId: file.filename,
        }));
        product.images.push(...newImages);
      }

      await product.save();
      await product.populate("sellerId", "name hostel verifiedSeller profileImage");

      return successResponse(res, 200, "Product updated.", { product });
    } catch (error) {
      next(error);
    }
  });
};

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:publicId
// @access  Private (owner only)
const deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 404, "Product not found.");

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized.");
    }

    if (product.images.length <= 1) {
      return errorResponse(res, 400, "Product must have at least one image.");
    }

    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    const imageExists = product.images.find((img) => img.publicId === decodedPublicId);
    if (!imageExists) return errorResponse(res, 404, "Image not found.");

    await deleteFromCloudinary(decodedPublicId);
    product.images = product.images.filter((img) => img.publicId !== decodedPublicId);
    await product.save();

    return successResponse(res, 200, "Image deleted.", { images: product.images });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (owner only)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 404, "Product not found.");

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "You can only delete your own listings.");
    }

    // Delete all images from Cloudinary
    await Promise.all(product.images.map((img) => deleteFromCloudinary(img.publicId)));

    await product.deleteOne();

    return successResponse(res, 200, "Product deleted successfully.");
  } catch (error) {
    next(error);
  }
};

// @desc    Mark product as sold
// @route   PUT /api/products/:id/sold
// @access  Private (owner only)
const markAsSold = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 404, "Product not found.");

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized.");
    }

    product.status = "sold";
    await product.save();

    // Increment seller's total sales
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalSales: 1 } });

    return successResponse(res, 200, "Product marked as sold.");
  } catch (error) {
    next(error);
  }
};

// @desc    Report a product
// @route   POST /api/products/:id/report
// @access  Private
const reportProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return errorResponse(res, 404, "Product not found.");

    if (product.college !== req.user.college) {
      return errorResponse(res, 403, "Not authorized.");
    }

    product.reportCount += 1;
    if (product.reportCount >= 3) product.isReported = true;
    await product.save();

    return successResponse(res, 200, "Product reported. Our team will review it.");
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by seller
// @route   GET /api/products/seller/:sellerId
// @access  Private
const getProductsBySeller = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const seller = await User.findById(req.params.sellerId);
    if (!seller) return errorResponse(res, 404, "Seller not found.");

    // College isolation
    if (seller.college !== req.user.college) {
      return errorResponse(res, 403, "Seller not found in your college.");
    }

    const filter = { sellerId: req.params.sellerId, status: "active" };
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ boosted: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return paginatedResponse(res, products, total, page, limit);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  markAsSold,
  reportProduct,
  getProductsBySeller,
};
