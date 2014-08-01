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
            db.query('create table users (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, createDate datetime default current_timestamp)', [], this);
        })
        .par(function() {
            db.query('create table transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, createDate datetime default current_timestamp, value REAL)', [], this);
        })
        .seq(function() {
            console.log('database ' + dbOptions.options.filename + ' created');
        });
});
