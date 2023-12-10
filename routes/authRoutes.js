// routes/authRoutes.js
// Coding by EffendyJr

const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

// Register endpoint
router.post("/register", authController.register);

// Login endpoint
router.post("/login", authController.login);

// Logout endpoint
router.post("/logout", authController.logout);

module.exports = router;