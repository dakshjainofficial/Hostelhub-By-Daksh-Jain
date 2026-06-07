/**
 * Maps email domains to college names.
 * Core HostelHub feature: college isolation.
 */
const COLLEGE_DOMAIN_MAP = {
  "vitbhopal.ac.in": "VIT Bhopal",
  "vit.ac.in": "VIT Vellore",
  "vitap.ac.in": "VIT-AP",
  "bits-pilani.ac.in": "BITS Pilani",
  "pilani.bits-pilani.ac.in": "BITS Pilani",
  "goa.bits-pilani.ac.in": "BITS Goa",
  "hyderabad.bits-pilani.ac.in": "BITS Hyderabad",
  "iitb.ac.in": "IIT Bombay",
  "iitd.ac.in": "IIT Delhi",
  "iitm.ac.in": "IIT Madras",
  "iitk.ac.in": "IIT Kanpur",
  "iitkgp.ac.in": "IIT Kharagpur",
  "iith.ac.in": "IIT Hyderabad",
  "iisc.ac.in": "IISc Bangalore",
  "manipal.edu": "Manipal University",
  "mahe.manipal.edu": "Manipal University",
  "srm.edu.in": "SRM University",
  "srmist.edu.in": "SRM University",
  "amrita.edu": "Amrita University",
  "christuniversity.in": "Christ University",
  "pes.edu": "PES University",
  "bmsce.ac.in": "BMS College of Engineering",
  "rvu.edu.in": "RV University",
  "mit.edu": "MIT",
  "nit.ac.in": "NIT",
  "nitk.ac.in": "NIT Karnataka",
  "nitp.ac.in": "NIT Patna",
};

/**
 * Extracts college name from a college email address.
 * @param {string} email - e.g. "user@vitbhopal.ac.in"
 * @returns {string|null} - e.g. "VIT Bhopal" or null if not a recognized college email
 */
const extractCollegeFromEmail = (email) => {
  if (!email || typeof email !== "string") return null;

  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return null;

  // Exact match
  if (COLLEGE_DOMAIN_MAP[domain]) return COLLEGE_DOMAIN_MAP[domain];

  // Subdomain match — e.g. "cs.iitb.ac.in" → "IIT Bombay"
  for (const [key, value] of Object.entries(COLLEGE_DOMAIN_MAP)) {
    if (domain.endsWith(`.${key}`) || domain === key) return value;
  }

  // Must end in .ac.in or .edu.in or .edu to be considered a college email
  const isCollegeDomain =
    domain.endsWith(".ac.in") ||
    domain.endsWith(".edu.in") ||
    domain.endsWith(".edu");

  if (!isCollegeDomain) return null;

  // Fallback: humanize domain name
  const parts = domain.split(".");
  const name = parts[0].replace(/-/g, " ");
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Validates that an email is a college email.
 */
const isCollegeEmail = (email) => {
  return extractCollegeFromEmail(email) !== null;
};

module.exports = { extractCollegeFromEmail, isCollegeEmail, COLLEGE_DOMAIN_MAP };
