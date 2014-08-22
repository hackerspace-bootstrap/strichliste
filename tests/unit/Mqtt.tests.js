var EventEmitter = require('events').EventEmitter;

var expect = require('chai').use(require('sinon-chai')).expect;
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
                expect(mqttClient.publish).to.be.calledOnce;
            });

            it('should publish the correct value', function () {
                expect(mqttClient.publish).to.be.calledWith('strichliste/transactionValue', '1337');
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
            var emitter = new EventEmitter();
            var mqttMock = mocks.createMqttMock(emitter);

            var clock, client, error;
            before(function (done) {
                clock = sinon.useFakeTimers();

                var MqttClientFactory = sandbox.require('../../lib/mqtt/ClientFactory', {
                    requires: {
                        mqtt: mqttMock
                    }
                });

                var myFactory = new MqttClientFactory();
                myFactory.createClient(defaultConfig, function (_error, _client) {
                    client = _client;
                    error = _error;
                    done();
                });

                clock.tick(42 * 1000);
            });

            after(function () {
                clock.restore();
            });

            it('should return an error', function () {
                expect(error.message).to.equal('Connect to MQTT broker mqtt:1883 timed out');
                expect(client).to.be.null;
            });

            it('should invoke with the correct parameters', function () {
                expect(mqttMock.createClient).to.be.calledWith(defaultConfig.port, defaultConfig.host);
            });
        });

        describe('create client success', function () {
            var emitter = new EventEmitter();
            var mqttMock = mocks.createMqttMock(emitter);

            var error, client;
            before(function (done) {
                var MqttClientFactory = sandbox.require('../../lib/mqtt/ClientFactory', {
                    requires: {
                        mqtt: mqttMock
                    }
                });

                var myFactory = new MqttClientFactory();
                myFactory.createClient(defaultConfig, function (_error, _client) {
                    client = _client;
                    error = _error;
                    done();
                });

                emitter.emit('connect', 'foo');
            });

            it('should not return an error', function () {
                expect(error).to.be.null;
                expect(client).to.equal(emitter);
            });

            it('should be called with correct parameters', function () {
                expect(mqttMock.createClient).to.be.calledWith(defaultConfig.port, defaultConfig.host);
            });
        });
    });
});