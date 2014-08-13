var EventEmitter = require('events').EventEmitter;

var expect = require('chai').expect;
var sinon = require('sinon');
var sandbox = require('sandboxed-module');

var mocks = require('../util/mocks');
var MqttWrapper = require('../../lib/mqtt/Wrapper');

var defaultConfig = {
    host: 'mqtt',
    port: 1883
};

describe('mqtt', function () {
    describe('mqttWrapper', function () {

        describe('publish success with client', function () {
            var mqttClient, mqttWrapper;

            before(function () {
                mqttClient = mocks.createMqttClientMock();

                mqttWrapper = new MqttWrapper(mqttClient);
                mqttWrapper.publishTransactionValue(1337);
            });

            it('should call publish once', function () {
                expect(mqttClient.publish.callCount).to.equal(1);
            });

            it('should publish the correct value', function () {
                expect(mqttClient.publish.args[0][0]).to.equal('strichliste/transactionValue');
                expect(mqttClient.publish.args[0][1]).to.equal('1337');
            });
        });

        describe('publish success without client', function () {

            var mqttWrapper = new MqttWrapper(null);

            it('should call publish once', function () {
                expect(mqttWrapper.publishTransactionValue(1337)).to.be.undefined;
            });
        });
    });
    describe('mqttClient', function () {
        describe('create client fails', function () {
            var clock = sinon.useFakeTimers();

            var emitter = new EventEmitter();
            var mqttMock = mocks.createMqttMock(emitter);
            var mqttClient = sandbox.require('../../lib/mqtt/client', {
                requires: {
                    mqtt: mqttMock
                }
            });

            it('should return an error', function (done) {
                mqttClient.createClient(defaultConfig, function (error, client) {
                    expect(error.message).to.equal('Connect to MQTT broker mqtt:1883 timed out');
                    expect(client).to.be.null;

                    expect(mqttMock.createClient.args[0][0]).to.equal(defaultConfig.port);
                    expect(mqttMock.createClient.args[0][1]).to.equal(defaultConfig.host);
                    done();
                });

                clock.tick(42*1000);
            });
        });

        describe('create client success', function () {
            var emitter = new EventEmitter();
            var mqttMock = mocks.createMqttMock(emitter);
            var mqttClient = sandbox.require('../../lib/mqtt/client', {
                requires: {
                    mqtt: mqttMock
                }
            });

            var error, client;
            before(function (done) {
                mqttClient.createClient(defaultConfig, function (_error, _client) {
                    error = _error;
                    client = _client;
                    done();
                });

                emitter.emit('connect', 'foo');
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
                expect(client).to.equal(emitter);
            });

            it('should be called with correct parameters', function () {
                expect(mqttMock.createClient.args[0][0]).to.equal(defaultConfig.port);
                expect(mqttMock.createClient.args[0][1]).to.equal(defaultConfig.host);
            });
        });
    });
});