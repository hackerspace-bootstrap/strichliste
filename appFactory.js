var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

var configuration = require('./lib/configuration');
var bootstrap = require('./lib/bootstrap');

function createApp(callback) {
    var app = express();

    app.use(cors());
    app.use(bodyParser.json());

    if (configuration.logging.active) {
        app.use(morgan('short'));
    }

    bootstrap.bootstrap(app, configuration, function(error) {
        if (error) return callback(error);

        callback(null, app);
    });
}

module.exports.create = createApp;