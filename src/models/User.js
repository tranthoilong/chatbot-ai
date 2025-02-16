const { sequelize, Sequelize } = require("../core/database");

const User = sequelize.define("User", {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    status:{
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 1
    }
    ,
    type_account: {
        type: Sequelize.DataTypes.ENUM("free trial", "premium", "pro"),
        defaultValue: "free trial"
    }
}, {
    timestamps: true,
    underscored: true, 
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