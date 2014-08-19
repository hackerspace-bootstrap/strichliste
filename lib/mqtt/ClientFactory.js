var once = require('once');
var mqtt = require('mqtt');

function MqttClientFactory () {
}

MqttClientFactory.prototype.createClient = function (config, callback) {
    callback = once(callback);

    setTimeout(function () {
        callback(new Error('Connect to MQTT broker ' + config.host + ':' + config.port + ' timed out'), null);
    }, 30 * 1000);

    var client = mqtt.createClient(config.port, config.host)
        .once('connect', function () {
            callback(null, client);
        });
};

module.exports = MqttClientFactory;