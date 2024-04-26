// Import required modules and dependencies
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const adminAuthRoutes = require("./routes/adminAuthRouter");
const restaurantLoginRoutes = require("./routes/restaurantLoginRouter");
const restaurantRoutes = require("./routes/restaurantsRouter");
const categoryRoutes = require("./routes/categoriesRouter");
const authMiddleware = require("./middleware/authMiddleware");
const app = express();

// Connect to MongoDB
connectDB();

//----- middleware -----
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/auth/restaurants", restaurantLoginRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/check-session", authMiddleware, (req, res) => {
  // If the middleware execution reaches here, it means the session is valid
  res.status(200).json({ message: "Session is valid", user: req.user });
});

// Handle requests to undefined routes
app.use("*", function (req, res) {
  res.status(404).json({ message: "Page not found" });
});

const PORT = process.env.PORT || 5000;

//rest api
app.use("/", function (req, res) {
  res.send("Restaurants Menu Server");
});

//run listen
app.listen(PORT, () => {
  console.log(
    `Server Running on ${process.env.DEV_MODE} mode on port ${PORT}`.bgCyan
      .white
  );
});

module.exports = app;
