const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const Admin = require("../models/adminSche");

// Admin register route
// router.post(
//   "/register",
//   [
//     check("username", "Username is required").not().isEmpty(),
//     check("email", "Please include a valid email").isEmail(),
//     check(
//       "password",
//       "Please enter a password with 6 or more characters"
//     ).isLength({
//       min: 6,
//     }),
//   ],
//   async (req, res) => {
//     // Check for validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { username, email, password } = req.body;

//     try {
//       // Check if admin already exists
//       let admin = await Admin.findOne({ email });
//       if (admin) {
//         return res.status(400).json({ msg: "Admin already exists" });
//       }

//       // Create new admin instance
//       admin = new Admin({
//         username,
//         email,
//         password,
//       });

//       // Encrypt password
//       const salt = await bcrypt.genSalt(10);
//       admin.password = await bcrypt.hash(password, salt);

//       // Save admin to database
//       await admin.save();

//       // Return JWT token
//       const payload = {
//         admin: {
//           id: admin.id,
//         },
//       };
//       console.log(payload);
//       jwt.sign(
//         payload,
//         process.env.JWT_SECRET,
//         { expiresIn: "1h" },
//         (err, token) => {
//           if (err) throw err;
//           res.json({ token });
//         }
//       );
//     } catch (err) {
//       console.error(err.message);
//       res.status(500).send("Server Error");
//     }
//   }
// );

// Admin login route
router.post(
  "/adminlogin",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if admin exists
      let admin = await Admin.findOne({ email });
      if (!admin) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      // Check if password matches
      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid Credentials" });
      }

      // Return JWT token
      const payload = {
        admin: {
          id: admin.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
