var express = require('express');

var configuration = require('./lib/configuration');

express()
    .use(express.static(__dirname + '/frontend'))
    .listen(configuration.port);

console.log( 'running on: ' + configuration.port );