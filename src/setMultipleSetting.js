const { database }= require('./database');

function setMultipleSetting(options, value) {
    return new Promise((resolve, reject) => {
        database.run(
            'INSERT INTO settings (options, value) VALUES (?, ?)',
            [options, value],
            function(err) {
                if (err) {
                    console.error("請不要重複設定同一個頻道ID");
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            }
        );
    });
}

module.exports = { setMultipleSetting };