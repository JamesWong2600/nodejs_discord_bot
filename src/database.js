const sqlite3 = require('sqlite3').verbose();



const database = new sqlite3.Database('bot.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        
        // Create both tables using the same connection
        database.serialize(() => {
            // Create users table
            database.run(`CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT,
                message_count INTEGER DEFAULT 0
            )`);

            // Create settings table
            database.run(`CREATE TABLE IF NOT EXISTS settings (
                options TEXT PRIMARY KEY,
                value TEXT UNIQUE
            )`);
        });
    }
});







module.exports = {database};