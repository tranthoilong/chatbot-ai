(function () {
    if (document.getElementById("chatbot-widget")) return;

    function getApiKey() {
        const chatbotContainer = document.getElementById("chatbot-container");
        return chatbotContainer ? chatbotContainer.getAttribute("data-bot-chat-key") : null;
    }

    function getDevMode(){
        const chatbotContainer = document.getElementById("chatbot-container");
        return chatbotContainer? chatbotContainer.getAttribute("data-dev-mode-lchat") === "true" : false;
    }

    let API_KEY = getApiKey() ||null;
    let DEV_MODE = getDevMode() || false;

    if(DEV_MODE){
        console.log("🔑 API Key:", API_KEY);
    }

    if (!API_KEY|| API_KEY!="123" ) {
        return; 
    }

    const style = document.createElement("style");
    style.innerHTML = `
        #chatbot-toggle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #0078ff;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 60px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transition: transform 0.3s ease-in-out;
        }
        #chatbot-toggle:hover {
            transform: scale(1.1);
        }
        .chat-container {
            width: 360px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
            position: fixed;
            bottom: 80px;
            right: 20px;
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 9999;
            transform: scale(0.9);
            opacity: 0;
            transition: all 0.3s ease-in-out;
        }
        .chat-container.open {
            display: flex;
            transform: scale(1);
            opacity: 1;
        }
        .chat-header {
            background: #0078ff;
            color: white;
            padding: 15px;
            font-size: 18px;
            font-weight: bold;
            text-align: center;
        }
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
            background: #f9f9f9;
            display: flex;
            flex-direction: column;
        }
        .message {
            padding: 10px 14px;
            margin: 6px;
            border-radius: 10px;
            max-width: 75%;
            word-wrap: break-word;
            font-size: 14px;
        }
        .user-message {
            background: #0078ff;
            color: white;
            align-self: flex-end;
            text-align: right;
            border-top-right-radius: 0;
        }
        .bot-message {
            background: #f1f1f1;
            align-self: flex-start;
            border-top-left-radius: 0;
        }
        .chat-input {
            display: flex;
            border-top: 1px solid #ccc;
            padding: 10px;
            background: white;
        }
        .chat-input input {
            flex: 1;
            padding: 12px;
            border: none;
            outline: none;
            font-size: 14px;
            border-radius: 6px;
            background: #f5f5f5;
        }
        .chat-input button {
            padding: 12px 15px;
            background: #0078ff;
            color: white;
            border: none;
            cursor: pointer;
            margin-left: 10px;
            border-radius: 6px;
            font-weight: bold;
            transition: background 0.3s ease;
        }
        .chat-input button:hover {
            background: #005bbf;
        }
    `;
    document.head.appendChild(style);

    const chatToggle = document.createElement("div");
    chatToggle.id = "chatbot-toggle";
    chatToggle.innerHTML = "💬";
    chatToggle.onclick = toggleChatbot;
    document.body.appendChild(chatToggle);

    const chatbotContainer = document.createElement("div");
    chatbotContainer.className = "chat-container";
    chatbotContainer.id = "chatbot-widget";
    chatbotContainer.innerHTML = `
        <div class="chat-header">💬 Chatbot AI</div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-input">
            <input type="text" id="userInput" placeholder="Nhập tin nhắn...">
            <button onclick="sendMessage()">➤</button>
        </div>
    `;
    document.body.appendChild(chatbotContainer);

    function toggleChatbot() {
        let chatbot = document.getElementById("chatbot-widget");
        chatbot.classList.toggle("open");
    }

    window.sendMessage = async function () {
        let message = document.getElementById("userInput").value.trim();
        let chatMessages = document.getElementById("chatMessages");

        if (!message) return;

        let userMessage = document.createElement("div");
        userMessage.className = "message user-message";
        userMessage.textContent = message;
        chatMessages.appendChild(userMessage);

        document.getElementById("userInput").value = "";

        try {
            let response = await fetch("http://localhost:5001/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, api_key: "user1_key" })
            });

            let data = await response.json();
            let botReply = data.response || "Xin lỗi, có lỗi xảy ra!";

            let botMessage = document.createElement("div");
            botMessage.className = "message bot-message";
            botMessage.textContent = botReply;
            chatMessages.appendChild(botMessage);

            chatMessages.scrollTop = chatMessages.scrollHeight;

        } catch (error) {
            console.error("Lỗi API:", error);
        }
    };

    document.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            window.sendMessage();
        }
    });
})();