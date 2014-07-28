var express = require('express');
var bodyParser = require('body-parser');

var configuration = require('./lib/configuration');
var bootstrap = require('./lib/bootstrap');

var app = express();

app.use(bodyParser.json());

app.options('*', function(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
});

bootstrap.bootstrap(app, configuration, function() {
    app.listen(configuration.port);

    console.log('running on port ' + configuration.port);
});