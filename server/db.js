const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Use true for Azure, false for local dev usually
        trustServerCertificate: true // Change to false for production
    }
};

const connectDB = async () => {
    try {
        await sql.connect(dbConfig);
        console.log('MSSQL Connected...');
    } catch (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
};

module.exports = { sql, connectDB };
