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

            (new routes.UserList(userPersistence)).mount(app);
            (new routes.User(userPersistence)).mount(app);
            (new routes.UserCreate(userPersistence)).mount(app);
            (new routes.TransactionCreate(userPersistence)).mount(app);

            app.use(function(err, req, res, next){
                res.status(err.errorCode);
                res.send(JSON.stringify({message: err.message}));
            });

            this();
        })
        .seq(callback)
        .catch(callback);
}

module.exports.bootstrap = bootstrap;