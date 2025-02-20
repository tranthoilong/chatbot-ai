const { sequelize, Sequelize } = require("../core/database");

const ChatId = sequelize.define("ChatId", {
    id: {
        type: Sequelize.DataTypes.TEXT,
        primaryKey: true
    },
    api_key: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'ApiKeys', 
            key: 'api_key',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    status: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 1
    },
    created_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
}, {
    timestamps: false, 
    underscored: true,
     tableName: "chat_id"
});

module.exports = ChatId;
