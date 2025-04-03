const Database = require('better-sqlite3');

const database = new Database('bot.db');


try{
// Create users table
database.pragma('encoding = "UTF-8"');

database.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username TEXT,
        message_count INTEGER DEFAULT 0
    )
`).run();

// Create settings table
database.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
        options TEXT PRIMARY KEY,
        value TEXT
    )
`).run();

// Create unique index
database.prepare(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_value 
    ON settings(value) 
    WHERE value IS NOT NULL
`).run();

database.prepare(`INSERT OR IGNORE INTO settings (options, value) VALUES ('NUMBER_GAME_CHANNEL', null)`).run();
database.prepare(`INSERT OR IGNORE INTO settings (options, value) VALUES ('VOCAB_GAME_CHANNEL', null)`).run();
database.prepare(`INSERT OR IGNORE INTO settings (options, value) VALUES ('ADMIN_ID', null)`).run();
database.prepare(`INSERT OR IGNORE INTO settings (options, value) VALUES ('BOT_NAME', null)`).run();
}catch (error) {
       console.error('Error creating tables:', error);
}


module.exports = {database};