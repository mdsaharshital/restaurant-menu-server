// isAdminMiddleware.js
const Admin = require("../models/adminSche"); // Import the Admin model

const isAdminMiddleware = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized1" }); // Return 401 Unauthorized if user is not authenticated
    }
    // Find the admin based on the user's email
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(403).json({ message: "Unauthorized2" }); // Return 403 Forbidden if user is not an admin
    }

    // Check if the admin has the admin role
    if (admin.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized3" }); // Return 403 Forbidden if user is not an admin
    }

    next(); // Allow the request to proceed
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = isAdminMiddleware;
