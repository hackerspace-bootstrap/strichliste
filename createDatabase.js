var seq = require('seq');
var args = require('yargs').argv;

var config = require('./lib/configuration');
var createDatabase = require('./lib/util/createDatabase');

var fileName = args.filename || null;
var dbOptions = config.database;

if (fileName) {
    dbOptions.options.filename = fileName;
}

createDatabase(dbOptions, function(error) {
    if (error) return console.log(error.message);

    console.log('database ' + dbOptions.options.filename + ' created');
});