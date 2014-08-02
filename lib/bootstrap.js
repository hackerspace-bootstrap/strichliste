var seq = require('seq');

var UserPersistence = require('./UserPersistence');
var factory = require('./database/Factory');
var configuration = require('./configuration');
var routes = require('./routes');
var Routes = require('./routing/Routes');
var mqttClient = require('./mqtt/client');
var MqttWrapper = require('./mqtt/Wrapper');
var initMiddleware = require('./initMiddleware');

var errors = require('./errors');

function bootstrap (app, configuration, callback) {
    seq()
        .par('db', function () {
            factory.create(configuration.database, this);
        })
        .par('mqttClient', function () {
            if (configuration.mqtt.enabled) {
                return mqttClient.createClient(this);
            }

            this(null, null);
        })
        .seq(function () {
            var userPersistence = new UserPersistence(this.vars.db);
            var mqttWrapper = new MqttWrapper(this.vars.mqttClient);

            app.use(initMiddleware());

            new Routes()
                .addRoute('userList', new routes.UserList(userPersistence))
                .addRoute('user', new routes.User(userPersistence))
                .addRoute('userCreate', new routes.UserCreate(userPersistence))
                .addRoute('transactionCreate', new routes.TransactionCreate(userPersistence, mqttWrapper))
                .addRoute('transactionList', new routes.TransactionList(userPersistence))
                .addRoute('transaction', new routes.Transaction(userPersistence))
                .mount(app);

            app.use(function (req, res, next) {
                var result = req.strichliste.result;

                if (!result) return next(new errors.NotFoundError('route ' + req.path + ' not found'));

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

            callback(null);
        })
        .catch(function (error) {
            callback(error);
        });
}

module.exports.bootstrap = bootstrap;