const { sequelize, Sequelize } = require("../core/database");

const ChatMessage = sequelize.define("ChatMessage", {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true
    },
    chat_id: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false,
        references: {
            model: 'ChatIds',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    question: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false
    },
    answer: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false
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
         tableName: "chat_message"
});

module.exports = ChatMessage;
