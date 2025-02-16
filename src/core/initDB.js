const { sequelize } = require("./database");
const User = require("../models/User");
const UserAPIKey = require("../models/UserAPIKey");

async function initDB() {
    try {
        console.log("🔄 Initializing Database...");

        await sequelize.sync({ alter: true });

        console.log("✅ Database initialized successfully!");
    } catch (error) {
        console.error("❌ Error initializing database:", error);
    }
}

module.exports = initDB;
