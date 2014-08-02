var figlet = require('figlet');

var version = require('./lib/util/version');
var configuration = require('./lib/configuration');
var appFactory = require('./appFactory');

appFactory.create(function(error, app) {
    if (error) return console.log('could not launch the server: ' + error.message);

    app.listen(configuration.port);

    figlet('Strichliste v' + version, function(error, data) {
        if (!error) console.log(data);

        console.log('running on port ' + configuration.port);
    });
});