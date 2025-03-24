const SimpleCache = require('./SimpleCache');
const db = require('./database');

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
        message.reply('恭喜你猜對了！，已獲得 1 分！');
        updateUserScore(message);
        cache.delete('numbergamestart');
        cache.delete('numbertoguess');
    } else if (number < cache.get('numbertoguess')) {
        cache.set('lowerlimit', number, 3600);
        message.reply(`${number}~${cache.get('upperlimit')}之間的數字！`);
    } else {
        cache.set('upperlimit', number, 3600);
        message.reply(`${cache.get('lowerlimit')}~${number}之間的數字！`);
    }
}

function updateUserScore(message) {
    db.run(`INSERT INTO users (user_id, username, message_count) 
        VALUES (?, ?, 1) 
        ON CONFLICT(user_id) 
        DO UPDATE SET message_count = message_count + 3, username = ?`,
    [message.author.id, message.author.username, message.author.username]);
}

module.exports = {
    startGame,
    handleGuess,
    cache
};