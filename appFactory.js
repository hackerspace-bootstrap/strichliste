var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var configuration = require('./lib/configuration');
var bootstrap = require('./lib/bootstrap');

module.exports.create = function(callback) {
    var app = express();

    app.use(cors());
    app.use(bodyParser.json());

    bootstrap.bootstrap(app, configuration, function(error) {
        if (error) return callback(error);

        callback(null, app);
    });
};