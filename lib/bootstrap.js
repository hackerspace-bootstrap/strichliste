var seq = require('seq');

var UserPersistence = require('./UserPersistence');
var factory = require('./database/Factory');
var configuration = require('./configuration');
var routes = require('./routes');

function bootstrap(app, configuration, callback) {
    seq()
        .seq('db', function() {
            factory.create(configuration.database, this);
        })
        .seq(function() {
            var userPersistence = new UserPersistence(this.vars.db);

            var userListRoute = new routes.UserList(userPersistence);
            app.get('/user', foo, userListRoute.route.bind(userListRoute));

            var userRoute = new routes.User(userPersistence);
            app.get('/user/:id', foo, userRoute.route.bind(userRoute));

            var userCreate = new routes.UserCreate(userPersistence);
            app.put('/user', foo, userCreate.route.bind(userCreate));

            var transactionCreate = new routes.TransactionCreate(userPersistence);
            app.put('/user/:id/transaction', foo, transactionCreate.route.bind(transactionCreate));

            app.use(function(err, req, res, next){
                res.status(err.errorCode);
                res.send(JSON.stringify({message: err.message}));
            });

            this();
        })
        .seq(callback)
        .catch(callback);


}

function foo(req, res, next) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Content-Type', 'application/json');

    next();
 }

module.exports.bootstrap = bootstrap;