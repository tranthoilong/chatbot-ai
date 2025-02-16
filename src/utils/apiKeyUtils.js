const { ApiKey } = require("../models/");

async function checkIsExitingApiKeyWithKey(apiKey) {
    const apiKeyRecord = await ApiKey.findOne({ where: { api_key: apiKey } });
    return!!apiKeyRecord;
}

module.exports = {checkIsExitingApiKeyWithKey}