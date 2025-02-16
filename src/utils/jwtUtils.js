const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "123@Long";

/**
 * Generates a JWT token with an expiration time.
 * 
 * @param {Object} payload - The data to be stored in the token.
 * @param {string | number} expiresIn - Expiration time (e.g., "1h", "30m", "7d").
 * @returns {string} JWT Token
 */
function createJWT(payload, expiresIn = "1h") {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verifies and decodes a JWT token.
 * 
 * @param {string} token - The JWT token to verify.
 * @returns {Object | null} Decoded token data if valid, otherwise null.
 */
function verifyJWT(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        console.error("❌ Invalid or expired token:", error.message);
        return null;
    }
}

module.exports = { createJWT, verifyJWT };
