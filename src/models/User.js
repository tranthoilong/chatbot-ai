const { sequelize, Sequelize } = require("../core/database");

const User = sequelize.define("User", {
    id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true
    },
    username: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false
    },
    password: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false
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
    underscored: true
});

module.exports = User;




// (async () => {
//     try {
//         await sequelize.sync({ alter: true });
//         console.log("✅ User model synchronized with database.");
//     } catch (error) {
//         console.error("❌ Error syncing User model:", error);
//     }
// })();