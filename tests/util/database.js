var seq = require('seq');
var once = require('once');

var createDatabase = require('../../lib/util/createDatabase');
var DBFactory = require('../../lib/database/Factory');

function createPlainDatabase (configuration, callback) {
    createDatabase(configuration, callback);
}

function create2Users5TransactionsDatabase (configuration, callback) {
    createDatabase(configuration, function (error) {
        if (error) return callback(error);

        DBFactory.create(configuration, function (error, db) {
            if (error) return callback(error);

            var end = once(function end (error) {
                db.close();

                callback(error);
            });

            //CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, createDate DATETIME DEFAULT current_timestamp)
            //CREATE TABLE transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, createDate DATETIME DEFAULT current_timestamp, value NUMERIC)

            seq()
                .par(function () {
                    db.query('INSERT INTO users (id, name, createDate) VALUES (1, "foo", "2014-01-01 00:23:42")', [], this);
                })
                .par(function () {
                    db.query('INSERT INTO users (id, name, createDate) VALUES (2, "bar", "2014-01-01 00:42:23")', [], this);
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
                .seq(end.bind(null, null))
                .catch(end);
        });
    });
}

module.exports = {
    createPlainDatabase: createPlainDatabase,
    create2Users5TransactionsDatabase: create2Users5TransactionsDatabase
};