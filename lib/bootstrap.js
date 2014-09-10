var path = require('path');

var seq = require('seq');

var UserPersistence = require('./UserPersistence');
var factory = require('./database/Factory');
var MqttClientFactory = require('./mqtt/ClientFactory');
var MqttWrapper = require('./mqtt/Wrapper');
var initMiddleware = require('./initMiddleware');
var parameterMiddleware = require('./parameters/middleware');
var Injector = require('./util/di/Injector');
var RoutesLoader = require('./routing/RoutesLoader');

var errors = require('./errors');

function bootstrap (app, configuration, callback) {
    seq()
        .par('db', function () {
            factory.create(configuration.database, this);
        })
        .par('mqttClient', function () {
            createMqttClient(configuration, this);
        })
        .seq(function () {
            setup(app, this.vars.db, this.vars.mqttClient, configuration);

            callback(null);
        })
        .catch(function (error) {
            callback(error);
        });
}

function setup(app, db, mqttClient, configuration) {
    var injector = new Injector();
    injector.register('db', db);
    injector.register('mqttClient', mqttClient);
    injector.register('configuration', configuration);

    injector.register('userLoader', UserPersistence);
    injector.register('mqttWrapper', MqttWrapper);

    app.use(initMiddleware());
    app.use(parameterMiddleware());

    new RoutesLoader(path.join(__dirname, 'routes'), injector)
        .load()
        .mount(app);

    app.use(function (req, res, next) {
        var result = req.strichliste.result;

        if (!result) return next(new errors.NotFoundError('route ' + req.method + ' ' + req.path + ' not found'));

        res
            .status(result.statusCode())
            .set('Content-Type', result.contentType())
            .send(result.content());
    });

    app.use(function (error, req, res, next) {
        res
            .status(error.errorCode)
            .send({message: error.message});
    });
}

function createMqttClient(configuration, callback) {
    if (configuration.mqtt.enabled) {
        return (new MqttClientFactory()).createClient(configuration.mqtt, callback);
    }

    return callback(null, null);
}

module.exports.bootstrap = bootstrap;