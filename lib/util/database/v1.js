var seq = require('seq');

function baseLine(db, callback) {
    console.log('running version 1 migration');

    seq()
        .par(function () {
            db.query('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, createDate DATETIME DEFAULT current_timestamp)', [], this);
        })
        .par(function () {
            db.query('CREATE TABLE transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, createDate DATETIME DEFAULT current_timestamp, value NUMERIC)', [], this);
        })
        .seq(function () {
            db.query('CREATE INDEX userId ON transactions(userId)', [], this);
        })
        .seq(callback.bind(null, null))
        .catch(callback);
}

module.exports = baseLine;