var seq = require('seq');

var UserPersistence = require('./UserPersistence');
var factory = require('./database/Factory');
var configuration = require('./configuration');
var routes = require('./routes');
var Routes = require('./routing/Routes');
var mqttClient = require('./mqtt/client');
var MqttWrapper = require('./mqtt/Wrapper');

function bootstrap (app, configuration, callback) {
    seq()
        .par('db', function() {
            factory.create(configuration.database, this);
        })
        .par('mqttClient', function() {
            if(configuration.mqtt.enabled) {
                return mqttClient.createClient(this);
            }

            this(null, null);
        })
        .seq(function() {
            var userPersistence = new UserPersistence(this.vars.db);
            var mqttWrapper = new MqttWrapper(this.vars.mqttClient);

            new Routes()
                .addRoute('userList', new routes.UserList(userPersistence))
                .addRoute('user', new routes.User(userPersistence))
                .addRoute('userCreate', new routes.UserCreate(userPersistence))
                .addRoute('transactionCreate', new routes.TransactionCreate(userPersistence, mqttWrapper))
                .addRoute('transactionList', new routes.TransactionList(userPersistence))
                .mount(app);

            app.use(function(req, res, next) {
                var result = req.result;

                res
                    .status(result.statusCode())
                    .set('Content-Type', result.contentType())
                    .end(JSON.stringify(result.content()));
            });

            app.use(function (err, req, res, next) {
                res.status(err.errorCode);
                res.send(JSON.stringify({message: err.message}));
            });

            callback(null);
        })
        .catch(function(error) {
            callback(error);
        });
}

module.exports.bootstrap = bootstrap;