const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const adminAuthRoutes = require("./routes/adminAuthRouter");
const userAuthRoutes = require("./routes/userAuthRouter");
const restaurantRoutes = require("./routes/restaurantsRouter");
const categoryRoutes = require("./routes/categoriesRouter");

const app = express();

// Connect to MongoDB
connectDB();

//----- middleware -----
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/auth/user", userAuthRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);

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
