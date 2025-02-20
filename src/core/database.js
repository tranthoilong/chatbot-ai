const { Sequelize } = require("sequelize");

const DATABASE_URL = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

console.log("🔗 Connecting to DB:", DATABASE_URL);

// const sequelize = new Sequelize(DATABASE_URL, {
//     dialect: "postgres",
//     logging: false,
// });

let sequelize

if(process.env.HOST!="localhost")
{
 sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});}else{
 sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    logging: false,
});
}

(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ PostgreSQL Connected via Sequelize");
    } catch (error) {
        console.error("❌ Connection Error:", error);
    }
})();

module.exports = { sequelize, Sequelize };
