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
    let chatBackgroundColor = chatbot_container_element.getAttribute('data-chat-background-color') ?? '#0078ff';

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
        // Check for image markdown pattern
        const imgPattern = /<img src='([^']+)' alt='([^']+)' style='([^']+)'\/>/g;
        if (imgPattern.test(text)) {
            return text.replace(imgPattern, "<img src='$1' alt='$2' style='$3'/>");
        }

        return text
            .replace(/\n\n/g, '</p><p>') 
            .replace(/\n/g, '<br>')      
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') 
            .replace(/\* (.*?)\n/g, '<li>$1</li>') 
            .replace(/<li>/g, '<ul><li>')        
            .replace(/<\/li>(?!<li>)/g, '</li></ul>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }

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
            background: ${chatBackgroundColor};
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
            background: ${chatBackgroundColor};
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
            background: ${chatBackgroundColor};
            color: white;
            align-self: flex-end;
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
            background: ${chatBackgroundColor};
            color: white;
            border: none;
            cursor: pointer;
            margin-left: 10px;
            border-radius: 6px;
            font-weight: bold;
            transition: background 0.3s ease;
        }
        .chat-input button:hover {
            background: ${chatBackgroundColor};
            opacity: 0.8;
        }
        #minimize-btn {
            border: none;
            background: transparent;
            padding: 0;
            cursor: pointer;
        }

        .chat-input button {
            padding: 12px 15px;
            background: ${chatBackgroundColor};
            color: white;
            border: none;
            cursor: pointer;
            margin-left: 10px;
            border-radius: 6px;
            font-weight: bold;
            transition: background 0.3s ease;
        }

        .chat-input button:hover {
            background: ${chatBackgroundColor};
            opacity: 0.8;
        }

        .chat-input button.disabled {
            background: #BDBDBD; 
            cursor: not-allowed; 
        }

        .chat-input button.disabled:hover {
            background: #BDBDBD; 
        }

        @keyframes typing {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
        }

        .typing-indicator {
            display: flex;
            padding: 10px;
            gap: 5px;
        }

        .typing-dot {
            width: 8px;
            height: 8px;
            background: #606060;
            border-radius: 50%;
        }

        .typing-dot:nth-child(1) { animation: typing 1s infinite; }
        .typing-dot:nth-child(2) { animation: typing 1s infinite 0.2s; }
        .typing-dot:nth-child(3) { animation: typing 1s infinite 0.4s; }

        .suggestion-chips {
            display: none;
            flex-wrap: wrap;
            gap: 8px;
            padding: 10px;
            background: white;
        }
        .suggestion-chip {
            background: #e3f2fd;
            padding: 8px 16px;
            border-radius: 16px;
            font-size: 14px;
            cursor: pointer;
            border: 1px solid #90caf9;
            transition: all 0.2s ease;
        }
        .suggestion-chip:hover {
            background: #bbdefb;
        }
        .show-suggestions-btn {
            background: #e3f2fd;
            border: 1px solid #90caf9;
            padding: 8px 16px;
            border-radius: 16px;
            cursor: pointer;
            margin: 10px;
            text-align: center;
        }
        .show-suggestions-btn:hover {
            background: #bbdefb;
        }
    `;
    document.head.appendChild(style);

    const chatToggle = document.createElement("div");
    chatToggle.id = "chatbot-toggle";
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
        <div class="show-suggestions-btn" onclick="toggleSuggestions()">Hiển thị câu hỏi gợi ý</div>
        <div class="suggestion-chips" id="suggestionChips"></div>
        <div class="chat-input">
            <input type="text" id="userInput" placeholder="Nhập tin nhắn...">
            <button onclick="sendMessage()">➤</button>
        </div>
    `;
    document.body.appendChild(chatbotContainer);

    async function loadSuggestions() {
        try {
            const response = await fetch(`${BASE_URL}/chat-scenarios`);
            const data = await response.json();
            const scenarios = data.scenarios.map(scenario => ({
                name: scenario.question,
                messages: [{
                    question: scenario.question,
                    answer: scenario.answer
                }]
            }));
            return scenarios;
        } catch (error) {
            console.error("Error loading suggestions:", error);
            return [];
        }
    }

    function displayWelcomeMessage() {
        const chatMessages = document.getElementById("chatMessages");
        const welcomeMessage = document.createElement("div");
        welcomeMessage.className = "message bot-message";
        welcomeMessage.innerHTML = `Xin chào! Tôi là ${chatBotName}. Tôi có thể giúp gì cho bạn?`;
        chatMessages.appendChild(welcomeMessage);
    }

    async function displaySuggestions() {
        const scenarios = await loadSuggestions();
        const suggestionChips = document.getElementById("suggestionChips");
        suggestionChips.innerHTML = "";

        scenarios.forEach(scenario => {
            const chip = document.createElement("div");
            chip.className = "suggestion-chip";
            chip.textContent = scenario.name;
            chip.onclick = () => {
                document.getElementById("userInput").value = scenario.messages[0].question;
                sendMessage();
            };
            suggestionChips.appendChild(chip);
        });
    }

    window.toggleSuggestions = function() {
        const suggestionChips = document.getElementById("suggestionChips");
        const showSuggestionsBtn = document.querySelector(".show-suggestions-btn");
        
        if (suggestionChips.style.display === "flex") {
            suggestionChips.style.display = "none";
            showSuggestionsBtn.textContent = "Hiển thị câu hỏi gợi ý";
        } else {
            suggestionChips.style.display = "flex";
            showSuggestionsBtn.textContent = "Ẩn câu hỏi gợi ý";
            displaySuggestions();
        }
    }

    function toggleChatbot() {
        let chatbot = document.getElementById("chatbot-widget");
        chatbot.classList.toggle("open");
        if(!uuid){
            uuid = generateUniqueCode();
            displayWelcomeMessage();
            displaySuggestions();
        }
    }

    document.getElementById("minimize-btn").onclick = function() {
        let chatbot = document.getElementById("chatbot-widget");
        chatbot.classList.toggle("open");
    };

    function showTypingIndicator() {
        const chatMessages = document.getElementById("chatMessages");
        const typingDiv = document.createElement("div");
        typingDiv.className = "message bot-message typing-indicator";
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return typingDiv;
    }

    window.sendMessage = async function () {
        if (isProcessing) {
            return;  
        }

        let message = document.getElementById("userInput").value.trim();
        let chatMessages = document.getElementById("chatMessages");

        if (!message) return;
        isProcessing = true;
        toggleSendButtonState();

        let userMessage = document.createElement("div");
        userMessage.className = "message user-message";
        userMessage.textContent = message;
        chatMessages.appendChild(userMessage);

        document.getElementById("userInput").value = "";

        // Show typing indicator
        const typingIndicator = showTypingIndicator();

        try {
            let response = await fetch(`${BASE_URL}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message, api_key:API_KEY,chat_bot_name:chatBotName,id_chat:uuid })
            });

            let data = await response.json();
            let botReply = data.response || "Xin lỗi, có lỗi xảy ra!";

            if(data){
                isProcessing = false;
            }

            // Remove typing indicator
            typingIndicator.remove();

            let botMessage = document.createElement("div");
            botMessage.className = "message bot-message";
            botMessage.innerHTML = formatChatbotAnswer(botReply);

            chatMessages.appendChild(botMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;

        } catch (error) {
            console.error("Lỗi API:", error);
            typingIndicator.remove();
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
