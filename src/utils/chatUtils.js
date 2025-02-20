const { ChatId, ChatMessage, ApiKey } = require("../models");
const { v4: uuidv4 } = require("uuid");


async function createChat(id,apiKey) {
    try {

        const chatExists = await ChatId.findOne({id});
        if (chatExists) {
            return;
        }

        const apiKeyRecord = await ApiKey.findOne({ where: { api_key: apiKey } });
        if (!apiKeyRecord) {
            throw new Error("API Key không hợp lệ.");
        }

        const newChat = await ChatId.create({
            id,
            api_key: apiKey
        });

        return newChat;
    } catch (error) {
        console.error("❌ Lỗi khi tạo ChatId:", error.message);
        throw error;
    }
}

async function createChatMessage(chatId, question, answer) {
    try {
        const chat = await ChatId.findOne({id:chatId});
        if (!chat) {
            throw new Error("ChatId không tồn tại.");
        }

        const newMessage = await ChatMessage.create({
            id: uuidv4(),
            chat_id: chatId,
            question,
            answer
        });

        return newMessage;
    } catch (error) {
        console.error("❌ Lỗi khi tạo ChatMessage:", error.message);
        throw error;
    }
}

async function getChatMessages(chatId) {
    try {
        const messages = await ChatMessage.findAll({
            where: { chat_id: chatId },
            order: [["created_at", "ASC"]]
        });

        return messages;
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách tin nhắn:", error.message);
        throw error;
    }
}


async function getChatsByApiKey(apiKey) {
    try {
        const chats = await ChatId.findAll({
            where: { api_key: apiKey },
            order: [["created_at", "DESC"]]
        });

        return chats;
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách ChatId:", error.message);
        throw error;
    }
}

async function getChatHistory(chatId) {
    try {

        const chat = await ChatId.findOne({id: chatId});
        if (!chat) {
            throw new Error("ChatId không tồn tại.");
        }

        const messages = await ChatMessage.findAll({
            where: { chat_id: chatId },
            order: [["created_at", "ASC"]]
        });

        const formattedMessages = messages.map(msg => ({
            question: msg.question,
            answer: msg.answer
        }));

        return formattedMessages;
    } catch (error) {
        console.error("❌ Lỗi khi lấy tin nhắn:", error.message);
        throw error;
    }
}

module.exports = {
    createChat,
    createChatMessage,
    getChatMessages,
    getChatsByApiKey,
    getChatHistory
};
