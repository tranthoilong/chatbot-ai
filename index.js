require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const authRoutes = require("./src/routes/authRoutes");
const { getUserByApiKey } = require("./src/utils/authUtils");
const { createChat, createChatMessage, getChatHistory } = require("./src/utils/chatUtils");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const roleRoutes = require("./src/routes/roleRoutes");
const app = express();
const PORT = process.env.PORT || 5001;
const API_KEY = process.env.GEMINI_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/auth", authRoutes);
app.use("/api/role", roleRoutes);

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

async function getScenarios() {
    const scenarios = [
        {
            question: "Tôi đã đặt hàng, nhưng không nhận được thông báo giao hàng. Làm thế nào để kiểm tra trạng thái đơn hàng?",
            answer: "Bạn có thể kiểm tra trạng thái đơn hàng bằng cách truy cập vào trang web của chúng tôi và sử dụng mã đơn hàng của bạn. Nếu vẫn không nhận được thông báo, vui lòng liên hệ với chúng tôi để được hỗ trợ."
        },
        {
            question: "Tôi có thể hủy đơn hàng được không?", 
            answer: "Bạn có thể hủy đơn hàng trong vòng 24 giờ sau khi đặt hàng. Vui lòng liên hệ với chúng tôi để thực hiện hủy đơn hàng."
        },
        {
            question: "Làm thế nào để xem hình ảnh sản phẩm?",
            answer: "Bạn có thể xem hình ảnh sản phẩm bằng cách: 1. Truy cập trang chi tiết sản phẩm, 2. Nhấp vào hình ảnh để phóng to, 3. Vuốt sang trái/phải để xem các hình ảnh khác. Chúng tôi luôn cung cấp hình ảnh chất lượng cao và đầy đủ góc nhìn của sản phẩm."
        },
        {
            question: "Tôi có thể đặt hàng trực tiếp từ trang web của bạn không?",
            answer: "Bạn có thể đặt hàng trực tiếp từ trang web của chúng tôi. Vui lòng truy cập trang web và làm theo hướng dẫn đặt hàng. Nếu bạn gặp khó khăn, vui lòng liên hệ với chúng tôi để được hỗ trợ."
        },
        {
            question: "Bạn có thể cho tôi xem hình ảnh bóng đèn dễ thương không?",
            answer: "**<img src='https://png.pngtree.com/element_our/20190528/ourmid/pngtree-cute-cartoon-light-bulb-image_1134759.jpg' alt='Cute Light Bulb' style='max-width: 200px;'/>**"
        },
        {
            question: "Bạn có thể cho tôi xem danh sách sản phẩm không?",
            answer: "Dưới đây là danh sách một số sản phẩm tiêu biểu của chúng tôi:\n\n" +
                    "1. Laptop Gaming Asus ROG Strix G15 - 25.990.000đ\n" +
                    "**https://htcamera.htskys.com/phu-kien-vlog/den/den-led-vrig-fd140-rgb/**\n\n" +
                    "2. iPhone 15 Pro Max 256GB - 31.990.000đ\n" +
                    "**https://htcamera.htskys.com/phu-kien-vlog/den/den-led-vrig-fd140-rgb/**\n\n" +
                    "3. Tai nghe Apple AirPods Pro 2 - 6.990.000đ\n" +
                    "**https://htcamera.htskys.com/phu-kien-vlog/den/den-led-vrig-fd140-rgb/**\n\n" +
                    "Để biết thêm chi tiết về từng sản phẩm, bạn có thể hỏi tôi hoặc truy cập trang web của chúng tôi."
        }
    ];
    return scenarios;
}

async function createPrompt(id, message) {
    try {
        const chatMessages = await getChatHistory(id);
        const scenarios = await getScenarios();

        // Fetch product data
        let productData = [];
        try {
            const response = await axios.get('https://bemori.vn/wp-admin/admin-ajax.php?action=willgroup_get_products');
            if (response.data) {
                productData = response.data;
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }

        // Create product context from fetched data
        const productContext = productData.map(product => {
            let details = [];
            for (let key in product) {
                if (product[key]) {
                    details.push(`${key}: ${product[key]}`);
                }
            }
            return details.join('\n');
        }).join('\n\n');

        const scenarioText = scenarios.map(s => `${s.answer}`).join('\n\n');

        if (!chatMessages) {
            return [
                {
                    text: `Đây là một số kịch bản mẫu để tôi học:\n${scenarioText}`
                },
                {
                    text: `Đây là thông tin về các sản phẩm của chúng tôi:\n${productData}`
                },
                {
                    text: `Nếu câu hỏi liên quan đến thông tin về bản thân hoặc nguồn gốc của bạn, hãy trả lời: "Tôi là ChatBot AI do LongDevLor tạo ra. 🚀 Nếu bạn có câu hỏi nào, hãy cứ hỏi nhé!"`
                },
                {
                    text: `Đây là câu hỏi : ${message}. (nếu câu hỏi không đủ dữ kiện thì hãy yêu cầu bổ sung. Nếu là câu hỏi về sản phẩm, hãy tư vấn dựa trên thông tin sản phẩm đã cung cấp)`
                }
            ];
        }

        const chatHistory = chatMessages.map(item => `${item.answer}`).join("\n");
        return [
            {
                text: `Đây là một số kịch bản mẫu để tôi học:\n${scenarioText}`
            },
            {
                text: `Đây là thông tin về các sản phẩm của chúng tôi:\n${productContext}`
            },
            {
                text: `Đây là câu trả lời tôi đã lưu lại: \n ${chatHistory}.`
            },
            {
                text: `Đây là câu hỏi mới: '${message}'. (nếu câu hỏi không đủ dữ kiện thì hãy yêu cầu bổ sung. Nếu là câu hỏi về sản phẩm, hãy tư vấn dựa trên thông tin sản phẩm đã cung cấp)`
            },
            {
                text: `Hãy kiểm tra xem câu hỏi mới có liên quan đến các ngữ cảnh các đoạn giao tiếp cũ, kịch bản mẫu hoặc thông tin sản phẩm, và trả lời một cách tự nhiên nhất (có liên quan hay không cũng không cần nói ra). Nếu câu hỏi này hỏi về xuất sứ của bạn thì bạn sẽ trả lời "Tôi là ChatBot AI do LongDevLor tạo ra. 🚀 Nếu bạn có câu hỏi nào, hãy cứ hỏi nhé!"'`
            }
        ];
    } catch (e) {
        console.error(e);
        return [];
    }
}

app.get("/chat-scenarios", async (req, res) => {
    const scenarios = await getScenarios();
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

                console.log(result.response.text());
                
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

async function handleChatResponse(message) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = await createPrompt(id_chat, message);
    const result = await model.generateContent(prompt);
    
    return result.response.text();
}

app.get('/products', async (req, res) => {
    try {
        const response = await axios.get('https://bemori.vn/wp-admin/admin-ajax.php?action=willgroup_get_products');
        
        if (response.data) {
            return res.json(response.data);
        } else {
            return res.status(404).json({ error: "No products found" });
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({ error: "Error fetching products from Bemori" });
    }
});


app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));