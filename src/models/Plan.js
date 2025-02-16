const { sequelize, Sequelize } = require("../core/database");

const Plan = sequelize.define("Plan", {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name: {
        type: Sequelize.DataTypes.STRING(50),
        allowNull: false
    },
    price: {
        type: Sequelize.DataTypes.DECIMAL(10, 2), 
    },
    max_api_keys: {
        type: Sequelize.DataTypes.INTEGER,
    },
    max_usage: {
        type: Sequelize.DataTypes.INTEGER,
    },
    duration: {
        type: Sequelize.DataTypes.INTEGER,
    },
    description: {
        type: Sequelize.DataTypes.TEXT,
    },
    status: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 1 
    },
    created_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP")
    }
}, {
    timestamps: false, 
    underscored: true, 
});

module.exports = Plan;
