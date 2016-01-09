var seq = require('seq');

var createDatabase = require('../../lib/util/createDatabase');

function createPlainDatabase (db, callback) {
    createDatabase(db, callback);
}

function create2Users5TransactionsDatabase (db, callback) {
    createDatabase(db, function (error) {
        if (error) return callback(error);

        //CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, createDate DATETIME DEFAULT current_timestamp)
        //CREATE TABLE transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, createDate DATETIME DEFAULT current_timestamp, value NUMERIC)

        seq()
            .par(function () {
                db.query('INSERT INTO users (id, name, mailAddress, createDate) VALUES (1, "foo", "fooMail", "2014-01-01 00:23:42")', [], this);
            })
            .par(function () {
                db.query('INSERT INTO users (id, name, mailAddress, createDate) VALUES (2, "bar", "barMail", "2014-01-01 00:42:23")', [], this);
            })
            .par(function () {
                db.query('INSERT INTO transactions (id, userId, value, createDate) VALUES (1, 1, 1, "2014-01-01 00:23:42")', [], this);
            })
            .par(function () {
                db.query('INSERT INTO transactions (id, userId, value, createDate) VALUES (2, 1, 1, "2014-01-01 00:23:43")', [], this);
            })
            .par(function () {
                db.query('INSERT INTO transactions (id, userId, value, createDate) VALUES (3, 1, 1, "2014-01-01 00:23:44")', [], this);
            })
            .par(function () {
                db.query('INSERT INTO transactions (id, userId, value, createDate) VALUES (4, 2, 1, "2014-01-01 00:23:45")', [], this);
            })
            .par(function () {
                db.query('INSERT INTO transactions (id, userId, value, createDate) VALUES (5, 2, 1, "2014-01-01 00:23:46")', [], this);
            })
            .seq(callback.bind(null, null))
            .catch(callback);
    });
}

function clearTables (db, callback) {
    seq()
        .par(function() {
            db.query('DELETE FROM users', [], this);
        })
        .par(function() {
            db.query('DELETE FROM transactions', [], this);
        })
        .seq(callback.bind(null, null))
        .catch(callback);
}

module.exports = {
    createPlainDatabase: createPlainDatabase,
    create2Users5TransactionsDatabase: create2Users5TransactionsDatabase,
    clearTables: clearTables
};