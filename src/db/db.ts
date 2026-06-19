import 'dotenv/config';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: Number(process.env.DB_PORT) || 3306,
};
const dbName = process.env.DB_NAME || 'blood_bank';

// A function to initialize the database and tables
export async function initializeDatabase() {
    try {
        // 1. Connect without DB name to create the database if it doesn't exist
        const connection = await mysql.createConnection(dbConfig);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.end();

        // 2. Now connect to the database to create tables
        const connWithDb = await mysql.createConnection({
            ...dbConfig,
            database: dbName
        });

        // 3. Create donors table
        await connWithDb.query(`
            CREATE TABLE IF NOT EXISTS donors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                mobile_number VARCHAR(20) NOT NULL,
                blood_group VARCHAR(10) NOT NULL,
                branch VARCHAR(20) NOT NULL,
                age INT NOT NULL,
                gender VARCHAR(10) NOT NULL,
                college_name VARCHAR(100) NOT NULL,
                last_donation_date DATE DEFAULT NULL,
                address TEXT DEFAULT NULL,
                password VARCHAR(255) NOT NULL DEFAULT '1234',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 4. Create contact_us table
        await connWithDb.query(`
            CREATE TABLE IF NOT EXISTS contact_us (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                subject VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Create blood_requests table
        await connWithDb.query(`
            CREATE TABLE IF NOT EXISTS blood_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                donor_id INT NOT NULL,
                requester_name VARCHAR(100) NOT NULL,
                requester_phone VARCHAR(20) NOT NULL,
                hospital_name VARCHAR(100) NOT NULL,
                blood_group VARCHAR(10) NOT NULL,
                location VARCHAR(100) NOT NULL,
                message TEXT NOT NULL,
                status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
            )
        `);

        await connWithDb.end();
        console.log('✅ Database and tables verified/created successfully.');

        // Test pool connection
        const conn = await pool.getConnection();
        console.log('Connected to MySQL Database (Pool)');
        conn.release();
    } catch (error) {
        console.error('❌ Database connection/initialization failed:', error);
        throw error;
    }
}

// Create a Connection Pool (Better than single connection)
export const pool = mysql.createPool({
    ...dbConfig,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export 'db' as alias for 'pool' (so service.ts works)
export const db = pool;