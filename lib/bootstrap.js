var seq = require('seq');

var morgan = require('morgan');

var UserPersistence = require('./UserPersistence');
var factory = require('./database/Factory');
var configuration = require('./configuration');
var routes = require('./routes');
var Routes = require('./routing/Routes');
var MqttClientFactory = require('./mqtt/ClientFactory');
var MqttWrapper = require('./mqtt/Wrapper');
var initMiddleware = require('./initMiddleware');
var parameterMiddleware = require('./parameters/middleware');

var errors = require('./errors');

function bootstrap (app, configuration, callback) {
    seq()
        .par('db', function () {
            factory.create(configuration.database, this);
        })
        .par('mqttClient', function () {
            if (configuration.mqtt.enabled) {
                return (new MqttClientFactory()).createClient(configuration.mqtt, this);
            }

            this(null, null);
        })
        .seq(function () {
            setup(app, this.vars.db, this.vars.mqttClient);

            callback(null);
        })
        .catch(function (error) {
            callback(error);
        });
}

function setup(app, db, mqttClient) {
    var userPersistence = new UserPersistence(db);
    var mqttWrapper = new MqttWrapper(mqttClient);

    if (configuration.logging.active) {
        app.use(morgan('short'));
    }

    app.use(initMiddleware());
    app.use(parameterMiddleware());

    new Routes()
        .addRoute('userList', new routes.UserList(userPersistence))
        .addRoute('user', new routes.User(userPersistence))
        .addRoute('userCreate', new routes.UserCreate(userPersistence))
        .addRoute('transactionCreate', new routes.TransactionCreate(userPersistence, mqttWrapper))
        .addRoute('transactionList', new routes.TransactionList(userPersistence))
        .addRoute('transaction', new routes.Transaction(userPersistence))
        .addRoute('metrics', new routes.Metrics(userPersistence))
        .addRoute('settings', new routes.Settings())
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

module.exports.bootstrap = bootstrap;