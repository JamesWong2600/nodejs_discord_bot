const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'token', '.env') });
const { Client, GatewayIntentBits } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

class SimpleCache {
    constructor() {
        this.cache = new Map();
    }

    // Set a value in cache with optional TTL (time to live) in seconds
    set(key, value, ttl = 0) {
        const item = {
            value,
            expiry: ttl ? Date.now() + (ttl * 1000) : null
        };
        this.cache.set(key, item);
    }

    // Get a value from cache
    get(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        // Check if item has expired
        if (item.expiry && Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    // Delete a value from cache
    delete(key) {
        this.cache.delete(key);
    }
}

const cache = new SimpleCache();

const db = new sqlite3.Database('bot.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        // Create users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT,
            message_count INTEGER DEFAULT 0
        )`);
    }
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
    // Ignore messages from bots
    if (message.author.bot) return;

    // Simple command handling
    if (message.content.startsWith('!hello')) {
        message.reply('Hello! 👋');
    }

    if (message.content.startsWith('!ping')) {
        message.reply('Pong! 🏓');
    }

    if (message.content.startsWith('!numbergame')) {
        cache.set('numbergamestart', true, 3600);
        const number = Math.floor(Math.random() * 100);
        cache.set('numbertoguess', number, 3600);
        console.log(number);
        message.reply('我已經想好一個數字了，你猜猜看吧！');
    }

    if (!isNaN(message.content) && message.content.trim() !== '' && cache.get('numbergamestart') === true) {
        const number = Number(message.content);
        if (number === cache.get('numbertoguess')) {
            message.reply('恭喜你猜對了！');
            cache.delete('numbergamestart');
            cache.delete('numbertoguess');  
        } else if (number < cache.get('numbertoguess')) {
            message.reply('太小了，再猜猜看吧！');
        } else if (number > cache.get('numbertoguess')) {
            message.reply('太大了，再猜猜看吧！');
        }
    }

    if (message.content.startsWith('!points')) {
        db.get('SELECT message_count FROM users WHERE user_id = ?',
            [message.author.id],
            (err, row) => {
                if (err) {
                    console.error(err);
                    message.reply('Error getting stats!');
                } else {
                    //cache.set('current_user_point', row.message_count,3600);
                    const result = detect_level(row.message_count);
                    const embed = {
                        color: 0x0099ff,
                        title: '🎮 使用者分數',
                        description: `使用者: ${message.author.username}`,
                        fields: [
                            {
                                name: '當前分數',
                                value: `${row ? row.message_count : 0}分(${result}等)`,
                                inline: true
                            }
                        ],
                        timestamp: new Date(),
                        footer: {
                            text: '保持講話以獲得更多分數',
                            icon_url: message.author.displayAvatarURL({ dynamic: true })
                        }
                    };
                    message.reply({ embeds: [embed] });
                    //message.reply(`你目前的分數是 ${row ? row.message_count : 0}`);
                }
            });
    }
    else{

        db.run(`INSERT INTO users (user_id, username, message_count) 
            VALUES (?, ?, 1) 
            ON CONFLICT(user_id) 
            DO UPDATE SET message_count = message_count + 1, username = ?`,
        [message.author.id, message.author.username, message.author.username]);
    }
});

function detect_level(point) {
    if (point <= 50) {
        level = 1;
        return level;
    }
    if (point <= 99) {
        level = 2;
        return level;
    }
    if (point <= 199) {
        level = 3;
        return level;
    }
    if (point <= 349) {
        level = 4;
        return level;
    }
    if (point <= 649) {
        level = 5;
        return level;
    }
    if (point <= 849) {
        level = 6;
        return level;
    }
}

// Login to Discord
client.login(process.env.DISCORD_TOKEN);