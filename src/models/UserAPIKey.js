const { sequelize, Sequelize } = require("../core/database");
const User = require("./User");
const { v4: uuidv4 } = require("uuid");

const UserAPIKey = sequelize.define("UserAPIKey", {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        },
        onDelete: "CASCADE"
    },
    api_key: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: () => uuidv4()
    },
    count_call_api: {
        type:Sequelize.DataTypes.INTEGER,
        defaultValue: 0
    }
    ,
    is_active: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: true
    },
}, {
    timestamps: true,
    underscored: true, 
});

User.hasMany(UserAPIKey, { foreignKey: "user_id", as: "apiKeys" });
UserAPIKey.belongsTo(User, { foreignKey: "user_id", as: "user" });
(async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log("✅ Database synchronized successfully.");
    } catch (error) {
        console.error("❌ Error syncing database:", error);
    }
})();
module.exports = UserAPIKey;
