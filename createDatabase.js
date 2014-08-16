var seq = require('seq');
var args = require('yargs').argv;

var Factory = require('./lib/database/Factory');
var config = require('./lib/configuration');

var fileName = args.filename || null;
var dbOptions = config.database;

if (fileName) {
    dbOptions.options.filename = fileName;
}

Factory.create(dbOptions, function(error, db) {
    if (error) return console.log(error.message);

    seq()
        .par(function() {
            db.query('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, createDate DATETIME DEFAULT current_timestamp)', [], this);
        })
        .par(function() {
            db.query('CREATE TABLE transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, createDate DATETIME DEFAULT current_timestamp, value NUMERIC)', [], this);
        })
        .seq(function() {
            db.query('CREATE INDEX userId ON transactions(userId)', [], this);
        })
        .seq(function() {
            console.log('database ' + dbOptions.options.filename + ' created');
        });
});
