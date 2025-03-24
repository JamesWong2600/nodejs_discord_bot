const { database }= require('./database');

function setMultipleSetting(options, value) {
    return new Promise((resolve, reject) => {
        database.run(
            'INSERT OR REPLACE INTO settings (options, value) VALUES (?, ?)',
            [options, value],
            function(err) {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                    return;
                }
                resolve(this.lastID);
            }
        );
    });
}

module.exports = { setMultipleSetting };