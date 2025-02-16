require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const User = require("./src/models/User");
const initDB = require("./src/core/initDB");
const authRoutes = require("./src/routes/authRoutes");
const { getUserByApiKey } = require("./src/utils/authUtils");

const app = express();
const PORT = process.env.PORT || 5001;
const API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));



const TYPE_CHAT = Object.freeze({
    PRO: "pro",
    PREMIUM: "premium",
    FREE_TRIAL: "free trial"
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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/api/auth", authRoutes);
app.post("/chat-meta", async (req, res) => {
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

app.post("/chat", async (req, res) => {
    const {message,api_key} = req.body;
    try {
        console.log(api_key);
    if(!api_key){
        return res.status(403).json({error: "Invalid API Key"});
    }
    let user = await getUserByApiKey(api_key);
    if(!user) {
        res.status(403).json({error: "Invalid API Key"});
    }
    console.log(user.dataValues);
    res.json({ response:message });
    }catch(err) {
        console.error(error);
        res.status(500).json({ error: "Error connecting to Gemini AI" });
    }

});



initDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});