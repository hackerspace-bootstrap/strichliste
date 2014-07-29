var seq = require('seq');

var UserPersistence = require('./UserPersistence');
var factory = require('./database/Factory');
var configuration = require('./configuration');
var routes = require('./routes');

function bootstrap (app, configuration, callback) {
    factory.create(configuration.database, function (error, db) {
        if (error) return callback(error);

        var userPersistence = new UserPersistence(db);

        (new routes.UserList(userPersistence)).mount(app);
        (new routes.User(userPersistence)).mount(app);
        (new routes.UserCreate(userPersistence)).mount(app);
        (new routes.TransactionCreate(userPersistence)).mount(app);

        app.use(function (err, req, res, next) {
            res.status(err.errorCode);
            res.send(JSON.stringify({message: err.message}));
        });

        callback(null);
    });

}

module.exports.bootstrap = bootstrap;