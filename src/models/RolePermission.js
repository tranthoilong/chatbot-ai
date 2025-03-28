const { sequelize, Sequelize } = require("../core/database");

const RolePermission = sequelize.define("RolePermission", {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true
    },
    role_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Roles',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    permission_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Permissions', 
            key: 'id',
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

module.exports = RolePermission;
