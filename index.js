require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const authRoutes = require("./src/routes/authRoutes");
const { getUserByApiKey } = require("./src/utils/authUtils");
const { createChat, createChatMessage, getChatHistory } = require("./src/utils/chatUtils");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 5001;
const API_KEY = process.env.GEMINI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/auth", authRoutes);

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function createPrompt(id, message) {
    try {
        const chatMessages = await getChatHistory(id);
        if (!chatMessages) {
            return [
                {
                    text: `Nếu câu hỏi này hỏi về xuất sứ của bạn thì bạn sẽ trả lời "Tôi là ChatBot AI do LongDevLor tạo ra. 🚀 Nếu bạn có câu hỏi nào, hãy cứ hỏi nhé!"`
                },
                {
                    text: `Đây là câu hỏi : ${message}. (nếu câu hỏi không đủ dữ kiện thì hãy yêu cầu bổ sung.)`
                }
            ];
        }

        const chatHistory = chatMessages.map(item => `Q: ${item.question} - A: ${item.answer}`).join("\n");
        return [
            {
                text: `Đây là câu hỏi và câu trả lời tôi đã lưu lại của tôi và bạn : \n ${chatHistory}.`
            },
            {
                text: `Đây là câu hỏi mới: '${message}'. (nếu câu hỏi không đủ dữ kiện thì hãy yêu cầu bổ sung.)`
            },
            {
                text: `Hãy kiểm tra xem câu hỏi mới có liên quan đến các ngữ cảnh các đoạn giao tiếp cũ, và trả lời một cách tự nhiên nhất (có liên quan hay không cũng không cần nói ra). Nếu câu hỏi này hỏi về xuất sứ của bạn thì bạn sẽ trả lời "Tôi là ChatBot AI do LongDevLor tạo ra. 🚀 Nếu bạn có câu hỏi nào, hãy cứ hỏi nhé!"'`
            }
        ];
    } catch (e) {
        console.error(e);
        return [];
    }
}

app.get("/chat-scenarios", (req, res) => {
    const scenarios = [
        {
            id: "tech-support-1",
            name: "Hỗ trợ kỹ thuật cơ bản",
            messages: [
                
            ]
        },
        {
            id: "product-inquiry",
            name: "Tư vấn sản phẩm",
            messages: [
                
            ]
        },
        {
            id: "order-tracking",
            name: "Theo dõi đơn hàng",
            messages: [

            ]
        }
    ]

    res.json({ scenarios });
});

app.post("/chat", async (req, res) => {
    const { message, api_key, use_pro, id_chat } = req.body;

    try {
        if (!id_chat || !api_key) {
            return res.json({ response: "Đang có sự cố xảy ra !!!" });
        }

        const user = await getUserByApiKey(api_key);
        if (!user) {
            return res.json({ response: "Đang có sự cố xảy ra !!!" });
        }

        try {
            if (use_pro) {
                const response = await axios.post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                    {
                        contents: [{
                            parts: [
                                { 
                                    text: "Giới thiệu về chính bạn: 'Tôi là một bot chat do LongDevLor phát triển. Tôi có thể giúp bạn trả lời các câu hỏi hoặc hỗ trợ trong các vấn đề khác.'"
                                },
                                {
                                    text: "Các chủ đề tôi có thể trả lời: \n- Công nghệ: Bao gồm các chủ đề như phần cứng, phần mềm, công nghệ mới nhất.\n- Phát triển phần mềm: Bao gồm lập trình, công cụ phát triển, phương pháp Agile.\n- Trí tuệ nhân tạo: Bao gồm học máy, học sâu, AI trong các ứng dụng thực tế."
                                },
                                { text: message }
                            ]
                        }]
                    },
                    { params: { key: API_KEY } }
                );
                
                return res.json({ response: response.data.candidates[0].content.parts[0].text });
            } else {
                const genAI = new GoogleGenerativeAI(API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
                
                const prompt = await createPrompt(id_chat, message);
                const result = await model.generateContent(prompt);
                
                await createChat(id_chat, api_key);
                await createChatMessage(id_chat, message, result.response.text());
                
                return res.json({ response: result.response.text() });
            }
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