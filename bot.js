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
    database.get(`SELECT 
        (SELECT value FROM settings WHERE options = 'ADMIN_ID') as admin_id,
        (SELECT value FROM settings WHERE options = 'BOT_NAME') as bot_name`, [], (err, row) => {
        if (err) {
            return;
        }
        if (row.admin_id === null) {
            //rl.question('請提供佩佩豬擁有者的DCID: ', (answer) => {
            const name = prompt('請提供機器人擁有者的DCID: ');
            //console.log(`Hello, ${name}!`);   
            database.run('UPDATE settings SET value = ? WHERE options = ?', [name, 'ADMIN_ID'])
            console.log(`已設置擁有者的DCID: ${name}`);
        }
        if (row.bot_name === null) {
            //rl.question('請提供佩佩豬擁有者的DCID: ', (answer) => {
            const name2 = prompt('請提供機器人的名稱: ');
            database.run('UPDATE settings SET value = ? WHERE options = ?', [name2, 'BOT_NAME'])
            console.log(`已設置機器人的名稱: ${name2}`);
            //rl.close();
            //});
        }
    });
    `database.get('SELECT value FROM settings WHERE options = ?', ['BOT_NAME'], (err, row) => {
        if (err) {
            return;
        }
        console.log('the value is '+ row.value);
        if (row.value === null) {
            //rl.question('請提供佩佩豬擁有者的DCID: ', (answer) => {
            const name2 = prompt('請提供機器人的名稱: ');
            //console.log(Hello, name!);   
            database.run('UPDATE settings SET value = ? WHERE options = ?', [name2, 'BOT_NAME'])
            console.log(已設置機器人的名稱: name2);
            //rl.close();
            //});
        }
    });`
});



client.on('messageCreate', async message => {
    if (message.author.bot) return;

    
    else if (message.content.startsWith('!numbergame')) {
        gamestatus = cache.get('numbergamestart');
        if (gamestatus === true) {
            message.reply('遊戲已經開始了！');
            message.delete();
            return;
        }
        database.get(`SELECT (SELECT value FROM settings WHERE options = ?) as number_game_channel`, ['NUMBER_GAME_CHANNEL'], (err, row) => {
            if (err) {
                console.error('Error fetching number game channel ID:', err);
                return;
            }
            console.log('the value iss '+ row.number_game_channel);
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
        });
    }

    else if (message.content.startsWith('!vocabgame')) {
        gamestatus = cache.get('vocabgamestart');
        if (gamestatus === true) {
            message.reply('遊戲已經開始了！');
            message.delete();
            return;
        }
        database.get(`SELECT (SELECT value FROM settings WHERE options = ?) as vocab_game_channel`, ['VOCAB_GAME_CHANNEL'], (err, row) => {
            if (err) {
                return;
            }
            console.log('the value iss '+ row.vocab_game_channel);
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
        });
    }



    else if (message.content.startsWith('!number_game_channel_id')) {
        database.get(`SELECT (SELECT value FROM settings WHERE options = 'ADMIN_ID') as admin_id,
            (SELECT value FROM settings WHERE options = 'BOT_NAME') as bot_name`, [], (err, row) => {
            if (err) {
                console.error('Error fetching admin ID:', err);
                return;
            }
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
                    database.run(
                        'UPDATE settings SET value = ? WHERE options = ?',
                        [content, 'NUMBER_GAME_CHANNEL'],
                        function(err) {
                            if (err) {
                                //console.log(err);
                                //console.error("請不要重複設定同一個頻道ID");
                                message.reply('請不要把猜數字跟猜詞語設定在同一個頻道！');
                                return;
                            }
                            else{
                                message.reply('機器人設置成功！');
                                return;
                            }
                        }
                    );
                    //setMultipleSetting('NUMBER_GAME_CHANNEL', content)
                } catch (error) {
                    console.error('Error configuring settings:', error);
                }
            }
        });

    }

    else if (message.content.startsWith('!vocab_game_channel_id')) {
        database.get(`SELECT (SELECT value FROM settings WHERE options = 'ADMIN_ID') as admin_id,
            (SELECT value FROM settings WHERE options = 'BOT_NAME') as bot_name`, [], (err, row) => {
            if (err) {
                return;
            }
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
                    database.run(
                        'UPDATE settings SET value = ? WHERE options = ?',
                        [content, 'VOCAB_GAME_CHANNEL'],
                        function(err) {
                            if (err) {
                                console.error("請不要重複設定同一個頻道ID");
                                message.reply('請不要把猜數字跟猜詞語設定在同一個頻道！');
                                return;
                            }
                            else{
                                message.reply('機器人設置成功！');
                                return;
                            }
                        }
                    );
                } catch (error) {
                    console.error('Error configuring settings:', error);
                }
            }
        });

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
        database.get(`SELECT (SELECT value FROM settings WHERE options = ? ) as vocab_game_channel,
            (SELECT value FROM settings WHERE options = ? ) as number_game_channel`, ['VOCAB_GAME_CHANNEL','NUMBER_GAME_CHANNEL'], (err, row) => {
            if (err) {
                console.error("請先設定頻道ID");
                return;
            }
            console.log('the value is '+ row);
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
                database.run(`INSERT INTO users (user_id, username, message_count) 
                    VALUES (?, ?, 1) 
                    ON CONFLICT(user_id) 
                    DO UPDATE SET message_count = message_count + 1, username = ?`,
                [message.author.id, message.author.username, message.author.username]);
                LevelUp(message);
                database.get('SELECT message_count FROM users WHERE user_id = ?',
                    [message.author.id],
                    (err, row) => {
                        //console.log(row.message_count);
                    });
            }
          }
        });
    }
});

client.login(process.env.DISCORD_TOKEN);