(function () {

    let chatbot_container_element = document.getElementById("chatbot-container");
    let uuid = '';

    if (!chatbot_container_element){
        console.error("Chatbot container element not found");
        return;
    }
    let isProcessing = false
    function generateUniqueCode() {
        const timestamp = Date.now().toString(36); 
        
        const randomNum = Math.floor(Math.random() * 100000).toString(36); 
        
        const uniqueCode = timestamp + randomNum;
        
        return uniqueCode;
    }
    
    let chatBotName = chatbot_container_element.getAttribute('data-chat-bot-name')??'Chatbot AI';
    let floatingPositionBottom = chatbot_container_element.getAttribute('data-chat-floating-bottom')??'20px';
    let floatingPositionRight = chatbot_container_element.getAttribute('data-chat-floating-right')??'20px';
    let botChatAvatar = chatbot_container_element.getAttribute('data-chat-avatar');

    function calculateFloatingPositionBottom(floatingPositionBottom) {
        let match = floatingPositionBottom.match(/([0-9.-]+)([a-zA-Z%]*)/);
    
        if (!match) {
            return '90px'; 
        }
    
        let baseValue = parseFloat(match[1]) || 20; 
        let unit = match[2] || 'px';
    
        let newValue = baseValue + 70;
    
        return newValue + unit;
    }


    let BASE_URL = chatbot_container_element.getAttribute('data-chat-bot-url');

    if(!BASE_URL){
        console.error("Chatbot container element must have data-chat-bot-url attribute");
        return;
    }

    if (BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL.slice(0, -1);
}

function formatChatbotAnswer(text) {
    return text
        .replace(/\n\n/g, '</p><p>') 
        .replace(/\n/g, '<br>')      
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
        .replace(/\* (.*?)\n/g, '<li>$1</li>') 
        .replace(/<li>/g, '<ul><li>')        
        .replace(/<\/li>(?!<li>)/g, '</li></ul>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');; 
}


    // console.log(BASE_URL)

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
        // console.log("🔑 API Key:", API_KEY);
    }

    if (!API_KEY) {
        return; 
    }

    const style = document.createElement("style");
    style.innerHTML = `
        #chatbot-toggle {
            position: fixed;
            bottom: ${floatingPositionBottom};
            right: ${floatingPositionRight};
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
            bottom: ${calculateFloatingPositionBottom(floatingPositionBottom)};
            right: ${floatingPositionRight};
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
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .chat-header svg {
            width: 20px;
            height: 20px;
            cursor: pointer;
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
            // text-align: right;
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
        #minimize-btn {
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
}

.chat-input button {
    padding: 12px 15px;
    background:rgb(38, 0, 255); 
    color: white;
    border: none;
    cursor: pointer;
    margin-left: 10px;
    border-radius: 6px;
    font-weight: bold;
    transition: background 0.3s ease;
}

.chat-input button:hover {
    background: rgb(31, 8, 160); 
}

.chat-input button.disabled {
    background: #BDBDBD; 
    cursor: not-allowed; 
}

.chat-input button.disabled:hover {
    background: #BDBDBD; 
}

    `;
    document.head.appendChild(style);

    const chatToggle = document.createElement("div");
    chatToggle.id = "chatbot-toggle";
    // chatToggle.innerHTML = "💬";
    if (botChatAvatar) {
        chatToggle.innerHTML = `<img src="${botChatAvatar}" alt="Chatbot Avatar" style="width: 100%; height: 100%; border-radius: 50%;">`;
    } else {
        chatToggle.innerHTML = "💬";
    }
    chatToggle.onclick = toggleChatbot;
    document.body.appendChild(chatToggle);

    const chatbotContainer = document.createElement("div");
    chatbotContainer.className = "chat-container";
    chatbotContainer.id = "chatbot-widget";
    chatbotContainer.innerHTML = `
        <div class="chat-header">
            <span>💬 ${chatBotName}</span>
            <button id="minimize-btn">
<?xml version="1.0" encoding="utf-8"?>

<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg fill="#FFFFFF" xmlns="http://www.w3.org/2000/svg" 
	 width="800px" height="800px" viewBox="0 0 52 52" enable-background="new 0 0 52 52" xml:space="preserve">
<g>
	<path d="M50,48.5c0,0.8-0.7,1.5-1.5,1.5h-45C2.7,50,2,49.3,2,48.5v-3C2,44.7,2.7,44,3.5,44h45
		c0.8,0,1.5,0.7,1.5,1.5V48.5z"/>
</g>
</svg>

            </button>
        </div>
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
        if(!uuid){
        uuid = generateUniqueCode()

        }
        // console.log(uuid)
    }

    document.getElementById("minimize-btn").onclick = function() {
        let chatbot = document.getElementById("chatbot-widget");
        chatbot.classList.toggle("open");
    };

    window.sendMessage = async function () {
        if (isProcessing) {
            return;  
        }
       

        let message = document.getElementById("userInput").value.trim();
        let chatMessages = document.getElementById("chatMessages");

        if (!message) return;
        isProcessing=true
        toggleSendButtonState();

        let userMessage = document.createElement("div");
        userMessage.className = "message user-message";
        userMessage.textContent = message;
        chatMessages.appendChild(userMessage);

        document.getElementById("userInput").value = "";

        try {
            let response = await fetch(`${BASE_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, api_key:API_KEY,chat_bot_name:chatBotName,id_chat:uuid })
            });

            let data = await response.json();
            let botReply = data.response || "Xin lỗi, có lỗi xảy ra!";

            if(data){
                // console.log(data)
                isProcessing=false
            }

            let botMessage = document.createElement("div");
            botMessage.className = "message bot-message";
            // botMessage.textContent =botReply;
            botMessage.innerHTML =formatChatbotAnswer(botReply);

            chatMessages.appendChild(botMessage);

            chatMessages.scrollTop = chatMessages.scrollHeight;

        } catch (error) {
            // console.error("URL ", BASE_URL);
            console.error("Lỗi API:", error);
        }
        toggleSendButtonState();
    };

    function toggleSendButtonState() {
        const sendButton = document.querySelector(".chat-input button");
        
        if (isProcessing) {
            sendButton.classList.add("disabled");
        } else {
            sendButton.classList.remove("disabled"); 
        }
    }

    document.addEventListener("keypress", function (event) {
        if (event.key === "Enter" && !isProcessing) {
            window.sendMessage();
        }
    });
})();
