var seq = require('seq');
var args = require('yargs').argv;

var config = require('./lib/configuration');
var dbFactory = require('./lib/database/Factory');
var createDatabase = require('./lib/util/createDatabase');

var fileName = args.filename || null;
var dbOptions = config.database;

if (fileName) {
    dbOptions.options.filename = fileName;
}

dbFactory.create(dbOptions, function (error, db) {
    if (error) throw error;

    createDatabase(db, function (error) {
        if (error) throw error;

        console.log('database ' + dbOptions.options.filename + ' created/updated');
    });
});