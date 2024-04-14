// isAdminMiddleware.js

const isAdminMiddleware = (req, res, next) => {
  // Check if user is authenticated and has an admin role
  if (req.user && req.user.role === "admin") {
    next(); // Allow the request to proceed
  } else {
    res.status(403).json({ message: "Unauthorized" }); // Return 403 Forbidden if user is not an admin
  }
};

module.exports = isAdminMiddleware;
