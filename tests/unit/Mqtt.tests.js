var expect = require('chai').expect;
var sinon = require('sinon');
var sandbox = require('sandboxed-module');

var mocks = require('../util/mocks');
var MqttWrapper = require('../../lib/mqtt/Wrapper');

describe('mqtt', function () {
    describe('mqttWrapper', function () {

        describe('publish success with client', function () {
            var mqttClient, mqttWrapper;

            before(function() {
                mqttClient = mocks.createMqttClientMock();

                mqttWrapper = new MqttWrapper(mqttClient);
                mqttWrapper.publishTransactionValue(1337);
            });

            it('should call publish once', function () {
                expect(mqttClient.publish.callCount).to.equal(1);
            });

            it('should publish the correct value', function() {
                expect(mqttClient.publish.args[0][0]).to.equal('strichliste/transactionValue');
                expect(mqttClient.publish.args[0][1]).to.equal(1337);
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

        describe('create client fails', function() {

            var mqttClient = sandbox.require('../../lib/mqtt/client', {
                requires: {
                    mqtt: {
                        createClient: function(host, port, callback) {
                            callback(new Error('caboom!'));
                        }
                    }
                }
            });

            it('should return an error', function() {
                mqttClient.createClient('lulz.de', 31337, function(error) {
                    expect(error.message).to.equal('caboom!');
                });
            });
        });

        describe('create client success', function() {

            var mqttClientMock = {
                createClient: sinon.spy(function(host, port, callback) {
                    process.nextTick(callback.bind(null, null));
                    return 'foobar';
                })
            };

            var mqttClient = sandbox.require('../../lib/mqtt/client', {
                requires: {
                    mqtt: mqttClientMock
                }
            });

            var error, client;
            before(function(done) {
                mqttClient.createClient('lulz.de', 31337, function(_error, _client) {
                    error = _error;
                    client = _client;
                    done();
                });
            });

            it('should return an error', function() {
                expect(error).to.be.null;
                expect(client).to.equal('foobar');
            });

            it('should be called with correct parameters', function() {
                expect(mqttClientMock.createClient.args[0][0]).to.equal(31337);
                expect(mqttClientMock.createClient.args[0][1]).to.equal('lulz.de');
            });
        });
    });
});