const { Client, GatewayIntentBits } = require('discord.js');


function Help(message) {
        const embed = {
            color: 0x0099ff,
            title: '🎮 指令列表',
            fields: [
                {
                    name: '以下指令',
                    value: `!numbergame - 開始猜數字遊戲\n!vocabgame - 開始猜英文單字遊戲\n!points - 顯示分數\n!number_game_channel_id - 設定猜數字遊戲頻道\n!voacb_game_channel_id - 設定猜單詞遊戲頻道\n!help - 顯示指令列表`,
                    inline: true
                }
            ],
        };
        message.reply({ embeds: [embed] });
}

module.exports = { Help };