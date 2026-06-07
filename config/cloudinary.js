const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

let productStorage;
let profileStorage;

if (useCloudinary) {
  // Product image storage
  productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "hostelhub/products",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
    },
  });

  // Profile image storage
  profileStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "hostelhub/profiles",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto" }],
    },
  });
} else {
  // Local storage fallback setup
  const uploadsDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  // Custom storage engines wrapping diskStorage
  productStorage = {
    _handleFile: (req, file, cb) => {
      diskStorage._handleFile(req, file, (err, info) => {
        if (err) return cb(err);
        info.path = `/uploads/${info.filename}`;
        cb(null, info);
      });
    },
    _removeFile: (req, file, cb) => {
      diskStorage._removeFile(req, file, cb);
    },
  };

  profileStorage = {
    _handleFile: (req, file, cb) => {
      diskStorage._handleFile(req, file, (err, info) => {
        if (err) return cb(err);
        info.path = `/uploads/${info.filename}`;
        cb(null, info);
      });
    },
    _removeFile: (req, file, cb) => {
      diskStorage._removeFile(req, file, cb);
    },
  };
}

const uploadProductImages = multer({
  storage: productStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
}).array("images", 5);

const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
}).single("profileImage");

const deleteFromCloudinary = async (publicId) => {
  if (useCloudinary) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error("Cloudinary delete error:", error);
    }
  } else {
    try {
      const filePath = path.join(__dirname, "../uploads", publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Local file delete error:", error);
    }
  }
};

module.exports = {
  cloudinary,
  uploadProductImages,
  uploadProfileImage,
  deleteFromCloudinary,
};

