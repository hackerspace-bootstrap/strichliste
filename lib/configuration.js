var path = require('path');

var configurations = require('configurations');
var args = require('yargs').argv;

var externalFile = args.externalFile || null;
var configParams = externalFile ? {externalconfig: externalFile} : {};

module.exports = configurations.load(path.join(__dirname, '../configuration'), configParams);