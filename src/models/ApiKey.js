const { sequelize, Sequelize } = require("../core/database");

const ApiKey = sequelize.define("ApiKey", {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true
    },
    user_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    api_key: {
        type: Sequelize.DataTypes.UUID,
        unique: true,
        allowNull: false
    },
    last_used: {
        type: Sequelize.DataTypes.DATE
    },
    usage_count: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 1
    },
    created_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
    updated_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP")
    }
}, {
    timestamps: false, 
    underscored: true
});

module.exports = ApiKey;
