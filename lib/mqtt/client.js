var mqtt = require('mqtt');

module.exports = {
    createClient: function(host, port, callback) {
        var client = mqtt.createClient(port, host, function(error) {
            callback(error, client);
        });
    }
};