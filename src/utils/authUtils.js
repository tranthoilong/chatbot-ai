const User = require("../models/User");
const UserAPIKey = require("../models/UserAPIKey");

async function getUserByApiKey(apiKey) {
    try {
        const apiKeyRecord = await UserAPIKey.findOne({ 
            where: { api_key: apiKey },
            include: { model: User, as: "user" } 
        });

        if (!apiKeyRecord) {
            return null; 
        }

        return apiKeyRecord.user; 
    } catch (error) {
        console.error("❌ Lỗi lấy thông tin user từ API Key:", error);
        return null;
    }
}

module.exports = { getUserByApiKey };
