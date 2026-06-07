const { verifyToken } = require("../config/jwt");
const Admin = require("../models/Admin");

const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin access denied. No token provided.",
      });
    }

    const decoded = verifyToken(token);

    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized as admin.",
      });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) {
      return res.status(403).json({
        success: false,
        message: "Admin account not found or deactivated.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid admin token." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Admin token expired." });
    }
    next(error);
  }
};

// Superadmin only
const superAdminOnly = (req, res, next) => {
  if (req.admin?.role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: "Super admin access required.",
    });
  }
  next();
};

module.exports = { adminProtect, superAdminOnly };
