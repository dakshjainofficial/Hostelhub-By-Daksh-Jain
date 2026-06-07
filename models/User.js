const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    college: {
      type: String,
      required: [true, "College is required"],
      trim: true,
    },
    hostel: {
      type: String,
      trim: true,
      default: "",
    },
    profileImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    verifiedSeller: {
      type: Boolean,
      default: false,
    },
    trustedSeller: {
      type: Boolean,
      default: false,
    },
    trustedSellerExpiry: {
      type: Date,
      default: null,
    },
    featuredSeller: {
      type: Boolean,
      default: false,
    },
    featuredSellerExpiry: {
      type: Date,
      default: null,
    },
    savedItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    // Analytics / Premium
    plan: {
      type: String,
      enum: ["basic", "premium", "business"],
      default: "basic",
    },
    planExpiry: {
      type: Date,
      default: null,
    },
    totalViews: { type: Number, default: 0 },
    totalChats: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Extract college from email domain
userSchema.statics.extractCollege = function (email) {
  const domainMap = {
    "vitbhopal.ac.in": "VIT Bhopal",
    "vit.ac.in": "VIT Vellore",
    "bits-pilani.ac.in": "BITS Pilani",
    "iitb.ac.in": "IIT Bombay",
    "iitd.ac.in": "IIT Delhi",
    "iitm.ac.in": "IIT Madras",
    "iisc.ac.in": "IISc Bangalore",
    "nit.ac.in": "NIT",
    "manipal.edu": "Manipal University",
    "srm.edu.in": "SRM University",
  };

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;

  // Check exact match
  if (domainMap[domain]) return domainMap[domain];

  // Check partial match (e.g., subdomain handling)
  for (const [key, value] of Object.entries(domainMap)) {
    if (domain.endsWith(key)) return value;
  }

  // Fallback: capitalize domain parts
  const parts = domain.split(".");
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + " University";
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
