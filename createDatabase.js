var seq = require('seq');

var Factory = require('./lib/database/Factory');
var config = require('./lib/configuration');

Factory.create(config.database, function(error, db) {
    if (error) {
        return console.log(error.message);
    }

    seq()
        .par(function() {
            db.query('create table users (id INTEGER PRIMARY KEY AUTOINCREMENT, name text, createDate date)', [], this);
        })
        .par(function() {
            db.query('create table transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, createDate date, value REAL)', [], this);
        })
        .seq(function() {
            console.log('done');
        });
});
