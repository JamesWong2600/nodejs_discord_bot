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
const { Check } = require('./src/check');
const readline = require('readline');
const prompt = require('prompt-sync')({
    sigint: true,
    encoding: 'utf8'
});

process.stdin.setEncoding('utf8');
process.stdout.setEncoding('utf8');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    try{
        const row = database.prepare(`SELECT 
        (SELECT value FROM settings WHERE options = 'ADMIN_ID') as admin_id,
        (SELECT value FROM settings WHERE options = 'BOT_NAME') as bot_name`).get();
        console.log(row.admin_id);
        console.log(row.bot_name);
        if (row.admin_id === null) {
            //rl.question('請提供佩佩豬擁有者的DCID: ', (answer) => {
            const name = prompt('請提供機器人擁有者的DCID: ');
            //console.log(`Hello, ${name}!`);   
            database.prepare(`UPDATE settings SET value = '${name}' WHERE options = 'ADMIN_ID'`).run();
            console.log(`已設置擁有者的DCID: ${name}`);
        }
        if (row.bot_name === null) {
            //rl.question('請提供佩佩豬擁有者的DCID: ', (answer) => {
            const name2 = prompt('請提供機器人的名稱: ');
            database.prepare(`UPDATE settings SET value = '${name2}' WHERE options = 'BOT_NAME'`).run();
            console.log(`已設置機器人的名稱: ${name2}`);
            //rl.close();
            //});
        }
    }catch (error) {
        console.error('Error creating tables:', error);
        return;
    }
});



client.on('messageCreate', async message => {
    if (message.author.bot) return;

    
    else if (message.content.startsWith('!numbergame')) {
        let gamestatus = cache.get('numbergamestart');
        if (gamestatus === true) {
            //message.reply('遊戲已經開始了！');
            return;
        }
        try{
            const row = database.prepare(`SELECT (SELECT value FROM settings WHERE options = 'NUMBER_GAME_CHANNEL') 
                as number_game_channel`).get();
            if (row.number_game_channel === null) {
                console.error("請先設定頻道ID");
                message.reply('請先設定頻道ID');
                return;
            } else {
            if (message.channel.id === `${row.number_game_channel}` ) {
                startGame(message);
                return;
            }
            }
        }catch (error) {
            console.error('Error fetching number game channel ID:', err);
            return;
        }

    }

    else if (message.content.startsWith('!vocabgame')) {
        let vocabgamestatus = cache.get('vocabgamestart');
        if (vocabgamestatus === true) {
            //message.reply('遊戲已經開始了！');
            return;
        }
        try{
            const row = database.prepare(`SELECT (SELECT value FROM settings WHERE options = 'VOCAB_GAME_CHANNEL') 
                as vocab_game_channel`).get();
            if (row.vocab_game_channel === null) {
                console.error("請先設定頻道ID");
                message.reply('請先設定頻道ID');
                return;
            } else {
            if (message.channel.id === `${row.vocab_game_channel}` ) {
                startVocabGame(message);
                return;
            }
            }
        }catch (error) {
            console.error('Error fetching number game channel ID:', err);
            return;


        }
    }

    



    else if (message.content.startsWith('!number_game_channel_id')) {
        try{
        const row = database.prepare(`SELECT 
            (SELECT value FROM settings WHERE options = 'ADMIN_ID') as admin_id,
            (SELECT value FROM settings WHERE options = 'BOT_NAME') as bot_name`).get();
            if (message.author.id !== row.admin_id) {
                message.reply(`你不是${row.bot_name}的擁有者，無法使用此指令！`);
                return;
            }
            else{    
                const content = message.content.split(' ').slice(1).join(' ');
                if (!content) {
                    message.reply('請提供頻道ID');
                    return;
                }
                try {
                    const row = database.prepare(`UPDATE settings SET value = '${content}'
                        WHERE options = 'NUMBER_GAME_CHANNEL'`,).run();
                    message.reply('機器人設置成功！');
                    return;
                } catch (error) {
                    console.error('Error configuring settings:', error);
                    message.reply('請不要把猜數字跟猜詞語設定在同一個頻道！');
                    return;
                }
            }
        }catch (error) {
            console.error('Error fetching admin ID:', err);
            return;
        }



    }

    else if (message.content.startsWith('!vocab_game_channel_id')) {
        try{
            const row = database.prepare(`SELECT 
                (SELECT value FROM settings WHERE options = 'ADMIN_ID') as admin_id,
                (SELECT value FROM settings WHERE options = 'BOT_NAME') as bot_name`).get();
            if (message.author.id !== row.admin_id) {
                message.reply(`你不是${row.bot_name}的擁有者，無法使用此指令！`);
                return;
            }
            else{
                const content = message.content.split(' ').slice(1).join(' ');
                if (!content) {
                    message.reply('請提供頻道ID');
                    return;
                }
                try {
                    const row =  database.prepare(`UPDATE settings SET value =
                         '${content}' WHERE options = 'VOCAB_GAME_CHANNEL'`,).run();
                    message.reply('機器人設置成功！');
                    return;
                } catch (error) {
                    console.error("請不要重複設定同一個頻道ID");
                    message.reply('請不要把猜數字跟猜詞語設定在同一個頻道！');
                    return;
                }
            }

        }catch (error) {
            return;
        } 
    }    
    

    else if (message.content.startsWith('!points')) {
        showPoints(message);
        return;
    }

    else if (message.content.startsWith('!help')) {
        Help(message);
        return;
    }

    else if (message.content.startsWith('!check')) {
        Check(message);
        return;
    }

    else{
        try{
        const row = database.prepare(`SELECT (SELECT value FROM settings WHERE options = 'VOCAB_GAME_CHANNEL' ) as vocab_game_channel,
            (SELECT value FROM settings WHERE options = 'NUMBER_GAME_CHANNEL' ) as number_game_channel`).get();
            if (row === undefined) {
                console.error("請先設定頻道ID");
                return;
            } else {
            if (message.channel.id === `${row.vocab_game_channel}` ) {
                console.log(message.content);
                handleVocabGuess(message)
                return;
            }
            if (message.channel.id === `${row.number_game_channel}` ) {
                if (!isNaN(message.content) && message.content.trim() !== '') {
                    if (cache.get('numbergamestart') === true) {
                        handleGuess(message);
                    }
                }
                console.log(message.content);
                return;
            }
            else{
                database.prepare(`INSERT INTO users (user_id, username, message_count) 
                    VALUES ('${message.author.id}', '${message.author.username}', 1) 
                    ON CONFLICT(user_id) 
                    DO UPDATE SET message_count = message_count + 1, username = '${message.author.username}'`).run();
                LevelUp(message);
            }
        }
        }catch (error) {
            console.error("請先設定頻道ID");
            return;
        } 
    }
});

client.login(process.env.DISCORD_TOKEN);