const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'token', '.env') });
const { Client, GatewayIntentBits } = require('discord.js');
const { startGame, handleGuess, cache } = require('./src/numbergame');
const { showPoints } = require('./src/showpoints.js');
const { database }  = require('./src/database');
const { startVocabGame, handleVocabGuess } = require('./src/vocab');
const { LevelUp } = require('./src/LevelUp');
const { setMultipleSetting } = require('./src/setMultipleSetting');
const { Help } = require('./src/help');

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
    if (message.author.bot) return;

    
    if (message.content.startsWith('!numbergame')) {
        database.get('SELECT value FROM settings WHERE options = ?', ['NUMBER_GAME_CHANNEL'], (err, row) => {
            if (err) {
                return;
            }
            console.log('the value is '+ row);
            if (row === undefined) {
                console.error("請先設定頻道ID");
                message.reply('請先設定頻道ID');
            } else {
            if (message.channel.id === `${row.value}` ) {
                console.log(row);
                startGame(message);
            }
            }
        });
    }

    if (message.content.startsWith('!vocabgame')) {
        database.get('SELECT value FROM settings WHERE options = ?', ['VOCAB_GAME_CHANNEL'], (err, row) => {
            if (err) {
                return;
            }
            console.log('the value is '+ row);
            if (row === undefined) {
                console.error("請先設定頻道ID");
                message.reply('請先設定頻道ID');
            } else {
            if (message.channel.id === `${row.value}` ) {
                console.log(row);
                startVocabGame(message);
            }
        }
        });
    }

    if (!isNaN(message.content) && message.content.trim() !== '') {
        if (cache.get('numbergamestart') === true) {
            handleGuess(message);
        }
    }

    if (message.content.startsWith('!number_game_channel_id')) {
        const content = message.content.split(' ').slice(1).join(' ');
        if (!content) {
            message.reply('Please provide a channel ID.');
            return;
        }
        try {
            await setMultipleSetting('NUMBER_GAME_CHANNEL', content)
            message.reply('機器人設置成功！');
        } catch (error) {
            console.error('Error configuring settings:', error);
            message.reply('請不要把猜數字跟猜詞語設定在同一個頻道！');
        }
    }

    if (message.content.startsWith('!vocab_game_channel_id')) {
        const content = message.content.split(' ').slice(1).join(' ');
        if (!content) {
            message.reply('Please provide a channel ID.');
            return;
        }
        try {
            await setMultipleSetting('VOCAB_GAME_CHANNEL', content)
            message.reply('機器人設置成功！');
        } catch (error) {
            console.error('Error configuring settings:', error);
            message.reply('請不要把猜數字跟猜詞語設定在同一個頻道！');
        }
    }

    if (message.content.startsWith('!points')) {
        showPoints(message);
    }

    if (message.content.startsWith('!help')) {
        Help(message);
    }


    else{
        database.get('SELECT value FROM settings WHERE options = ?', ['VOCAB_GAME_CHANNEL'], (err, row) => {
            if (err) {
                console.error("請先設定頻道ID");
                return;
            }
            console.log('the value is '+ row);
            if (row === undefined) {
                console.error("請先設定頻道ID");
            } else {
            if (message.channel.id === `${row.value}` ) {
                console.log(row);
                handleVocabGuess(message)
            }
            else{
                database.run(`INSERT INTO users (user_id, username, message_count) 
                    VALUES (?, ?, 1) 
                    ON CONFLICT(user_id) 
                    DO UPDATE SET message_count = message_count + 1, username = ?`,
                [message.author.id, message.author.username, message.author.username]);
                LevelUp(message);
                database.get('SELECT message_count FROM users WHERE user_id = ?',
                    [message.author.id],
                    (err, row) => {
                        console.log(row.message_count);
                    });
            }
          }
        });
    }
});

client.login(process.env.DISCORD_TOKEN);