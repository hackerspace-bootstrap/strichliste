var mqtt = require('mqtt');

var configuration = require('../configuration').mqtt;

function MqttWrapper (mqttClient) {
    this._mqttClient = mqttClient || null;
}

MqttWrapper.prototype.publishTransactionValue = function (value) {
    if (this._mqttClient === null) {
        return;
    }

    this._mqttClient.publish(configuration.topics.transactionValue, value);
};

module.exports = MqttWrapper;