const SimpleCache = require('./SimpleCache');
const { database } = require('./database');
const { Client, GatewayIntentBits } = require('discord.js');
const cache = new SimpleCache();

function startGame(message) {
    cache.set('numbergamestart', true, 3600);
    const number = Math.floor(Math.random() * 1000);
    cache.set('numbertoguess', number, 3600);
    cache.set('upperlimit', 1000, 3600);
    cache.set('lowerlimit', 0, 3600);
    console.log(number);
    message.reply('我已經想好一個數字了，你猜猜看吧！');
}

function handleGuess(message) {
    const number = Number(message.content);
    if (number === cache.get('numbertoguess')) {
        message.reply('恭喜你猜對了！，已獲得 10 分！');
        updateUserScore(message);
        cache.delete('numbergamestart');
        cache.delete('numbertoguess');
    } 
    else if (number > cache.get('upperlimit')){
        message.reply(`超出範圍`);
    }
    else if (number < cache.get('lowerlimit')){
        message.reply(`超出範圍`);
    }
    else if (number < cache.get('numbertoguess')) {
        cache.set('lowerlimit', number, 3600);
        message.reply(`${number}~${cache.get('upperlimit')}之間的數字！`);
    } else {
        cache.set('upperlimit', number, 3600);
        message.reply(`${cache.get('lowerlimit')}~${number}之間的數字！`);
    }
}

function updateUserScore(message) {
    database.prepare(`INSERT INTO users (user_id, username, message_count) 
        VALUES ('${message.author.id}', '${message.author.username}', 10) 
        ON CONFLICT(user_id) 
        DO UPDATE SET message_count = message_count + 10, username = '${message.author.username}'`).run();
}

module.exports = {
    startGame,
    handleGuess,
    cache
};