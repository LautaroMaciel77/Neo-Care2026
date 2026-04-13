// /config/db.js
const sql = require("mssql");
const dotenv = require("dotenv");

dotenv.config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false, // Necesario para Azure, o SSL
        trustServerCertificate: true, // entornos locales
    },
};

const connectDB = async () => {
    try {
        await sql.connect(dbConfig);
        console.log("🟢 Base de datos conectada correctamente.");
    } catch (error) {
        console.error("🔴 Error conectando a la base de datos:", error);
        process.exit(1); // Detiene la app
    }
};

module.exports = { connectDB, sql };