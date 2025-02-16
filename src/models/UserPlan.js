const { sequelize, Sequelize } = require("../core/database");

const UserPlan = sequelize.define("UserPlan", {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id',
        }
    },
    plan_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Plans',
            key: 'id',
        }
    },
    start_date: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    end_date: {
        type: Sequelize.DataTypes.DATE
    },
    status: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 1
    },
    created_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
        type: Sequelize.DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
    }
}, {
    timestamps: false,
    underscored: true,
});

module.exports = UserPlan;
