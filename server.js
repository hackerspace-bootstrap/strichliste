var figlet = require('figlet');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var configuration = require('./lib/configuration');
var version = require('./lib/version');
var bootstrap = require('./lib/bootstrap');

var app = express();

app.use(cors());
app.use(bodyParser.json());

bootstrap.bootstrap(app, configuration, function() {
    app.listen(configuration.port);

    figlet('Strichliste v' + version, function(error, data) {
        if (!error) {
            console.log(data);
        }

        console.log('running on port ' + configuration.port);
    });
});