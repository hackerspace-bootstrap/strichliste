var mqtt = require('mqtt');

module.exports = {
    createClient: function (config, callback) {

        var timedOut = false;
        var connectTimeout = setTimeout(function() {
            timedOut = true;
            callback(new Error('Connect to MQTT broker ' + config.host + ':' + config.port + ' timed out'), null);
        }, 30*1000);

        var client = mqtt.createClient(config.port, config.host)
            .once('connect', function () {
                if(timedOut === false) {
                    clearTimeout(connectTimeout);
                    callback(null, client);
                }
            });
    }
};