const SimpleCache = require('./SimpleCache');
const { database } = require('./database');
const wordList = require('word-list-json');


const cache = new SimpleCache();

function startVocabGame(message) {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const selectedWord = wordList[randomIndex];
    //const charList = selectedWord;
    const hidden_charlist = "-".repeat(selectedWord.length);
    cache.set('vocabgamestart', true, 3600);
    cache.set('theword', selectedWord, 3600);
    cache.set('charlist', selectedWord, 3600);
    cache.set('hidden_charlist', hidden_charlist, 3600);
    console.log(selectedWord);
    console.log(hidden_charlist);
    message.reply('猜單詞游戲已開始！');
    //charList.forEach(item => {
    //    console.log(item);
    //    x+=1;
    //    cache.set(`vocab_index${x}`, item, 3600);
   // });
    
}

//!vocabgame
function handleVocabGuess(message) {
    if ((cache.get('vocabgamestart') === true) && (message.content.length === 1)) {
        let charlist = Array.from(cache.get('charlist'));
        let theword = cache.get('theword');
        let hidden_charlist = Array.from(cache.get('hidden_charlist'));
        //console.log(hidden_charlist);
        //console.log(charlist);l
        const guess = message.content.toLowerCase();
        //console.log(Array.from(charlist));
        if (charlist.includes(guess)) {
            let matchIndex = charlist.indexOf(guess);
            console.log(matchIndex);
            hidden_charlist[matchIndex] = guess; 
            charlist[matchIndex] = '-'; 
            cache.set('charlist', charlist.join(''), 3600);
            cache.set('hidden_charlist', hidden_charlist.join(''), 3600);
            if(theword === hidden_charlist.join('')){
                message.reply('你已經猜對了！已獲得17分！');
                cache.delete('vocabgamestart');
                cache.delete('charlist');
                cache.delete('hidden_charlist');
                cache.delete('theword');
                updateVocabUserScore(message);
            }else{
                const displayword = hidden_charlist.join('')
                console.log(hidden_charlist.join('').toString());
                message.reply(displayword);

               
            }
        } else {
            message.reply('這個字母不在單字中！');
        }
    }
    
}

function updateVocabUserScore(message) {
    database.run(`INSERT INTO users (user_id, username, message_count) 
        VALUES (?, ?, 17) 
        ON CONFLICT(user_id) 
        DO UPDATE SET message_count = message_count + 17, username = ?`,
    [message.author.id, message.author.username, message.author.username]);
}

module.exports = {
    startVocabGame,
    handleVocabGuess,
    cache
};