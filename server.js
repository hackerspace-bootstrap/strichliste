var figlet = require('figlet');

var version = require('./lib/util/version');
var configuration = require('./lib/configuration');
var appFactory = require('./appFactory');

console.log(figlet.textSync('Strichliste v' + version));

appFactory.create(function(error, app) {
    if (error) return console.log('could not launch the server: ' + error.message);

    app.listen(configuration.port, function() {
        console.log('running on port ' + configuration.port);
    });
});