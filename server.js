var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var configuration = require('./lib/configuration');
var bootstrap = require('./lib/bootstrap');

var app = express();

app.use(cors());
app.use(bodyParser.json());

bootstrap.bootstrap(app, configuration, function() {
    app.listen(configuration.port);

    console.log('running on port ' + configuration.port);
});