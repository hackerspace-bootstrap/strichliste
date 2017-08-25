var once = require('once');
var seq = require('seq');

var Factory = require('../database/Factory');

module.exports = function (configuration, callback) {
    Factory.create(configuration, function (error, db) {
        if (error) return console.log(error.message);

        var end = once(function end (error) {
            db.close();

            callback(error);
        });

        seq()
            .seq(function () {
                db.query('DROP TABLE IF EXISTS users', [], this);
            })
            .seq(function () {
                db.query('DROP TABLE IF EXISTS transactions', [], this);
            })
            .par(function () {
                db.query('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, createDate DATETIME DEFAULT current_timestamp)', [], this);
            })
            .par(function () {
                db.query('CREATE TABLE transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, createDate DATETIME DEFAULT current_timestamp, value NUMERIC, comment TEXT)', [], this);
            })
            .seq(function () {
                db.query('CREATE INDEX userId ON transactions(userId)', [], this);
            })
            .seq(end.bind(null, null))
            .catch(end);
    });
};
