require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;



app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
const API_KEY = process.env.GEMINI_API_KEY;


const VALID_API_KEYS = {
    "user1_key": "valid",
    "user2_key": "valid"
};

app.post("/chat", async (req, res) => {
    const { message, api_key } = req.body;

    if (!VALID_API_KEYS[api_key]) {
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



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
