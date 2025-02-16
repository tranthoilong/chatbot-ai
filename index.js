require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const authRoutes = require("./src/routes/authRoutes");
const { getUserByApiKey } = require("./src/utils/authUtils");

const app = express();
const PORT = process.env.PORT || 5001;
const API_KEY = process.env.GEMINI_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/api/auth", authRoutes);

app.post("/chat", async (req, res) => {
    const { message, api_key } = req.body;
    try {
        console.log(api_key);

        if (!api_key) {
            return res.json({ response: "Đang có sự cố xảy ra !!!" });
        }

        let user = await getUserByApiKey(api_key);
        if (!user) {
            return res.json({ response: "Đang có sự cố xảy ra !!!" });
        }

        console.log(user);

        try {
            const response = await axios.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                {
                    contents: [
                        { parts: [
                            { text: "Nếu có ai hỏi thông tin về bạn, bạn chỉ cung cấp thông tin là 'Tôi là một bot chat do LongDevLor phát triển.'" },
                            { text: message },
                        ] }
                    ]
                },
                { params: { key: API_KEY } }
            );

            return res.json({ response: response.data.candidates[0].content.parts[0].text });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Error connecting to AI" });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error in processing request" });
    }
});


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));