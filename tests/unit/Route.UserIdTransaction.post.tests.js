var expect = require('chai').use(require('sinon-chai')).expect;

var TransactionCreate = require('../../lib/routes/UserIdTransaction.post');
var mocks = require('../util/mocks');

describe('transactionCreateRoute', function () {
    describe('no value', function () {
        var route = new TransactionCreate(null, null);
        var req = mocks.createRequestMock({
            params: {userId: 1},
            body: {},
            strichliste: {result: {name: 'foo'}}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(400);
            expect(error.message).to.equal('not a number: undefined');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });
    });

    describe('zero value', function () {
        var route = new TransactionCreate(null, null);
        var req = mocks.createRequestMock({
            params: {userId: 1},
            body: {value: 0}
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(400);
            expect(error.message).to.equal('value must not be zero');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });
    });

    describe('lower account boundary', function () {
        var route = new TransactionCreate(null, null);
        var req = mocks.createRequestMock({
            params: {userId: 1},
            body: {value: -100},
            strichliste: {
                result: mocks.createResultMock({balance: 1})
            }
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an forbidden error if the new balance cuts below a certain boundary', function () {
            expect(error.errorCode).to.equal(403);
            expect(error.message).to.equal('transaction value of -100 leads to an overall account balance of -99 which goes below the lower account limit of -23');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });
    });

    describe('upper account boundary', function () {
        var route = new TransactionCreate(null, null);
        var req = mocks.createRequestMock({
            params: {userId: 1},
            body: {value: 100},
            strichliste: {
                result: mocks.createResultMock({balance: 1})
            }
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an forbidden error if the new balance is above a certain boundary', function () {
            expect(error.errorCode).to.equal(403);
            expect(error.message).to.equal('transaction value of 100 leads to an overall account balance of 101 which goes beyond the upper account limit of 42');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });
    });

    describe('upper transaction boundary', function () {
        var route = new TransactionCreate(null, null);
        var req = mocks.createRequestMock({
            params: {userId: 1},
            body: {value: 99999},
            strichliste: {
                result: mocks.createResultMock({balance: 1})
            }
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an forbidden error if the new balance is above a certain boundary', function () {
            expect(error.errorCode).to.equal(403);
            expect(error.message).to.equal('transaction value of 99999 exceeds the transaction maximum of 9999');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });
    });

    describe('lower transaction boundary', function () {
        var route = new TransactionCreate(null, null);
        var req = mocks.createRequestMock({
            params: {userId: 1},
            body: {value: -99999},
            strichliste: {
                result: mocks.createResultMock({balance: 1})
            }
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an forbidden error if the new balance is above a certain boundary', function () {
            expect(error.errorCode).to.equal(403);
            expect(error.message).to.equal('transaction value of -99999 falls below the transaction minimum of -9999');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });
    });

    describe('creation fails', function () {
        var persistence = mocks.createPersistenceMock({
            loadUserById: { error: null, result: {name: 'bert'} },
            createTransaction: {error: new Error('caboom'), result: null}
        });

        var route = new TransactionCreate(persistence, null);
        var req = mocks.createRequestMock({
            body: {value: 42},
            params: {userId: 100},
            strichliste: {
                result: mocks.createResultMock({name: 'foo'})
            }
        });

        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(500);
            expect(error.message).to.equal('unexpected: caboom');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });

        it('should call creatTransaction with the correct parameters', function () {
            expect(persistence.createTransaction).to.be.calledOnce;
            expect(persistence.createTransaction).to.be.calledWith(100, 42);
        });
    });

    describe('reload fails', function () {
        var persistence = mocks.createPersistenceMock({
            loadUserById: { error: null, result: {name: 'bert'} },
            createTransaction: {error: null, result: 1337},
            loadTransaction: {error: new Error('caboomsel'), result: null}
        });

        var route = new TransactionCreate(persistence);
        var req = mocks.createRequestMock({
            body: {value: 1337},
            params: {userId: 1000},
            strichliste: {
                result: mocks.createResultMock({name: 'foo'})
            }
        });
        var res = mocks.createResponseMock();

        var error;
        route.route(req, res, function (_error) {
            error = _error;
        });

        it('should return an error if no name is set', function () {
            expect(error.errorCode).to.equal(500);
            expect(error.message).to.equal('error retrieving transaction: 1337');
        });

        it('should not sent any body', function () {
            expect(res._end).to.be.null;
        });

        it('should call createUser', function () {
            expect(persistence.createTransaction).to.be.calledOnce;
            expect(persistence.createTransaction).to.be.calledWith(1000, 1337);
        });

        it('should reload the user', function () {
            expect(persistence.loadTransaction).to.be.calledOnce;
            expect(persistence.loadTransaction).to.be.calledWith(1337);
        });
    });

    describe('success', function () {
        var persistence = mocks.createPersistenceMock({
            loadUserById: { error: null, result: {name: 'bert'} },
            createTransaction: {error: null, result: 1337},
            loadTransaction: {error: null, result: {value: 123}}
        });

        var mqttWrapper = mocks.createMqttWrapperMock();

        var route = new TransactionCreate(persistence, mqttWrapper);
        var req = mocks.createRequestMock({
            body: {value: 42.1},
            params: {userId: 100},
            strichliste: {
                result: mocks.createResultMock({name: 'foo'})
            }
        });
        var res = mocks.createResponseMock();

        var result;
        route.route(req, res, function () {
            result = req.strichliste.result;
        });

        it('should send a body', function () {
            expect(result.content()).to.deep.equal({value: 123});
        });

        it('should set the correct content type', function () {
            expect(result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function () {
            expect(result.statusCode()).to.equal(201);
        });

        it('should call createTransaction', function () {
            expect(persistence.createTransaction).to.be.calledOnce;
            expect(persistence.createTransaction).to.be.calledWith(100, 42.1);
        });

        it('should reload the transaction', function () {
            expect(persistence.loadTransaction).to.be.calledOnce;
            expect(persistence.loadTransaction).to.be.calledWith(1337);
        });

        it('should send an transaction value through mqtt', function () {
            expect(mqttWrapper.publishTransactionValue).to.be.calledOnce;
            expect(mqttWrapper.publishTransactionValue).to.be.calledWith(42.1);
        })
    });
});