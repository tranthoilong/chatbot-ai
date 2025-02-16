require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("./src/models/User");
const initDB = require("./src/core/initDB");



const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "localhost";
const API_KEY = process.env.GEMINI_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET || "123@Long";

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));



const TYPE_CHAT = Object.freeze({
    BASIC: "basic",
    PREMIUM: "premium",
    TRIAL: "trial"
});

let data_test = [
    {
        id: 123,
        userId: 1,
        username: "LongDevLor",
        type_chat:TYPE_CHAT.BASIC,
        expiresAt:  !true?"2025-02-01": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
    },
    {
        id: 124,
        userId: 2,
        username: "UserTest",
        type_chat: TYPE_CHAT.PREMIUM,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
    },
    {
        id: 125,
        userId: 3,
        username: "GuestUser",
        type_chat: TYPE_CHAT.TRIAL,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
];

function getDataInListById(id) {
    let user = data_test.find((item) => item.id === parseInt(id));
    if (new Date(user.expiresAt) < new Date()) {
        return null;
    }
    return user;
}

app.get("/users", async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
});

app.post("/chat", async (req, res) => {
    const { message, api_key } = req.body;

    if (!api_key) {
        return res.status(403).json({ error: "Invalid API Key" });
    }

    const user = getDataInListById(api_key);
    console.log(user);

    if (!user) {
        return res.status(403).json({ error: "Invalid API Key" });
    }
    

    if (!message) {
        return res.status(400).json({ error: "No message provided" });
    }

    try {
        const response = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
            {
                contents: [
                    { parts: [
                        { text: "Nếu có ai hỏi thông tin về bạn, bạn chỉ cung cập thông tin là 'Bạn là một bot chat do LongDevLor phát triển.'"},
                        { text: message},
                    ] },
                ]
            },
            { params: { key: API_KEY } }
        );

        res.json({ response: response.data.candidates[0].content.parts[0].text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error connecting to Gemini AI" });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/create-token", (req, res) => {
    const token = createJWT({ username: "LongDevLor",type_chat:[
        "basic"
    ] });
    const decoded = verifyJWT(token);
console.log("Decoded Token:", decoded);
    res.json({ token });
});

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
        console.error("Invalid or expired token:", error.message);
        return null;
    }
}

initDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});