var path = require('path');

var seq = require('seq');

var Persistence = require('./Persistence');
var factory = require('./database/Factory');
var MqttClientFactory = require('./mqtt/ClientFactory');
var MqttWrapper = require('./mqtt/Wrapper');
var initMiddleware = require('./initMiddleware');
var parameterMiddleware = require('./parameters/middleware');
var Injector = require('./util/di/Injector');
var RoutesLoader = require('./routing/RoutesLoader');

var resultHandler = require('./result/resultHandler');
var errorHandler = require('./result/errorHandler');

function bootstrap (app, configuration, callback) {
    seq()
        .par('db', function () {
            factory.create(configuration.database, this);
        })
        .par('mqttClient', function () {
            createMqttClient(configuration, this);
        })
        .seq(function () {
            _setup(app, this.vars.db, this.vars.mqttClient, configuration);

            callback(null);
        })
        .catch(function (error) {
            callback(error);
        });
}

function _setup (app, db, mqttClient, configuration) {
    var injector = _createInjector(db, mqttClient, configuration);

    app.use(initMiddleware());
    app.use(parameterMiddleware());

    new RoutesLoader(path.join(__dirname, 'routes'), injector)
        .load()
        .mount(app);

    app.use(resultHandler);
    app.use(errorHandler);
}

function _createInjector (db, mqttClient, configuration) {
    var injector = new Injector();

    injector.register('db', db);
    injector.register('mqttClient', mqttClient);
    injector.register('configuration', configuration);

    injector.register('persistence', Persistence);
    injector.register('mqttWrapper', MqttWrapper);

    return injector;
}

function createMqttClient(configuration, callback) {
    if (configuration.mqtt.enabled) {
        return (new MqttClientFactory()).createClient(configuration.mqtt, callback);
    }

    return callback(null, null);
}

module.exports.bootstrap = bootstrap;