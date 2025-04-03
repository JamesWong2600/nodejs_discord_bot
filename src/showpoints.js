const { database } = require('./database');
const { detectLevel } = require('./detectLevel');
const { Client, GatewayIntentBits } = require('discord.js');


function showPoints(message) {
    const row = database.prepare(`SELECT message_count FROM users WHERE user_id = '${message.author.id}'`).get();
    const points = row ? row.message_count : 0;
    const result = detectLevel(points);
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
}

module.exports = { showPoints };