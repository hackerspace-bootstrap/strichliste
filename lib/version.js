var path = require('path');

var pckJson = require(path.join(__dirname, '../package.json'));

module.exports = pckJson.version;