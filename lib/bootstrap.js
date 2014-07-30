var seq = require('seq');

var UserPersistence = require('./UserPersistence');
var factory = require('./database/Factory');
var configuration = require('./configuration');
var routes = require('./routes');
var Routes = require('./routing/Routes');

function bootstrap (app, configuration, callback) {
    factory.create(configuration.database, function (error, db) {
        if (error) return callback(error);

        var userPersistence = new UserPersistence(db);

        new Routes()
            .addRoute('userList', new routes.UserList(userPersistence))
            .addRoute('user', new routes.User(userPersistence))
            .addRoute('userCreate', new routes.UserCreate(userPersistence))
            .addRoute('transactionCreate', new routes.TransactionCreate(userPersistence))
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
    });

}

module.exports.bootstrap = bootstrap;