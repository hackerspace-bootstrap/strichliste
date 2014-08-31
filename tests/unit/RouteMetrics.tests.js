var expect = require('chai').use(require('sinon-chai')).expect;
var sinon = require('sinon');

var MetricsRoute = require('../../lib/routes/Metrics');
var mocks = require('../util/mocks');

describe('metricsRoute', function () {
    describe('sucess', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadMetrics: {
                error: null,
                result: {value: 42}
            }
        });

        var route = new MetricsRoute(userLoader);
        var req = mocks.createRequestMock();
        var res = mocks.createResponseMock();

        var spy = sinon.spy();
        route.route(req, res, spy);
        var result = req.strichliste.result;

        it('should call loadMetrics', function () {
            expect(userLoader.loadMetrics).to.be.calledOnce;
        });

        it('should return the metrics from persistence', function () {
            expect(result.content()).to.deep.equal({value: 42});
        });

        it('should set the correct content type', function () {
            expect(result.contentType()).to.equal('application/json');
        });

        it('should set the correct status code', function () {
            expect(result.statusCode()).to.equal(200);
        });

        it('should call the next method', function () {
            expect(spy).to.be.calledOnce;
        });
    });

    describe('fail', function () {
        var userLoader = mocks.createUserPersistenceMock({
            loadMetrics: {
                error: new Error('caboom'),
                result: null
            }
        });

        var error;
        before(function (done) {
            var route = new MetricsRoute(userLoader);
            var req = mocks.createRequestMock();
            var res = mocks.createResponseMock();

            route.route(req, res, function (_error) {
                error = _error;
                done();
            });
        });

        it('should call loadMetrics', function () {
            expect(userLoader.loadMetrics).to.be.calledOnce;
        });

        it('should call next with an eror', function () {
            expect(error.errorCode).to.equal(500);
            expect(error.message).to.equal('caboom');
        });
    });
});