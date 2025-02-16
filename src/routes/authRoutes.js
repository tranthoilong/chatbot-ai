const express = require("express");
const { register, login, getProfile, createApiKey, getUserFromApiKey } = require("../controllers/authController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateToken, getProfile);
router.post("/create-api-key", authenticateToken, createApiKey);
router.get("/user-by-api-key", getUserFromApiKey);

module.exports = router;
