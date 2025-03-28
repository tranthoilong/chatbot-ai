const { sequelize, Sequelize } = require("../core/database");

const Permission = sequelize.define("Permission", {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true
    },
    permission: {
        type: Sequelize.DataTypes.JSON,
        allowNull: false
    },
    is_full_access: {
        type: Sequelize.DataTypes.BOOLEAN,
        defaultValue: false
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

module.exports = Permission;
