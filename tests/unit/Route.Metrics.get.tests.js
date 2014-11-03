var expect = require('chai').use(require('sinon-chai')).expect;
var sinon = require('sinon');

var mocks = require('../util/mocks');

describe('metricsRoute', function () {
    var clock, MetricsRoute;

    before(function() {
        clock = sinon.useFakeTimers(1388530800000);
        MetricsRoute = require('../../lib/routes/Metrics.get');
    });

    after(function() {
        clock.restore();
    });

    describe('sucess', function () {
        var persistence, result, spy;

        before(function() {
            persistence = mocks.createPersistenceMock({
                loadMetrics: {
                    error: null,
                    result: {value: 42, days: [
                        {
                            date: "2013-12-31",
                            overallNumber: 1,
                            distinctUsers: 3,
                            dayBalance: 3,
                            dayBalancePositive: 7,
                            dayBalanceNegative: 7
                        }
                    ]}
                }
            });

            var route = new MetricsRoute(persistence, {metrics: {timespan: 3}});
            var req = mocks.createRequestMock();
            var res = mocks.createResponseMock();

            spy = sinon.spy();
            route.route(req, res, spy);
            result = req.strichliste.result;
        });

        it('should call loadMetrics', function () {
            expect(persistence.loadMetrics).to.be.calledOnce;
        });

        it('should return the metrics from persistence', function () {
            expect(result.content()).to.deep.equal(
                {
                    value: 42,
                    days:
                        [ { date: '2013-12-29',
                            overallNumber: 0,
                            distinctUsers: 0,
                            dayBalance: 0,
                            dayBalancePositive: 0,
                            dayBalanceNegative: 0
                        }, {
                            date: '2013-12-30',
                            overallNumber: 0,
                            distinctUsers: 0,
                            dayBalance: 0,
                            dayBalancePositive: 0,
                            dayBalanceNegative: 0
                        }, {
                            date: '2013-12-31',
                            overallNumber: 1,
                            distinctUsers: 3,
                            dayBalance: 3,
                            dayBalancePositive: 7,
                            dayBalanceNegative: 7
                        }, { date: '2014-01-01',
                            overallNumber: 0,
                            distinctUsers: 0,
                            dayBalance: 0,
                            dayBalancePositive: 0,
                            dayBalanceNegative: 0
                        }
                    ]
                }
            );
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
        var persistence = mocks.createPersistenceMock({
            loadMetrics: {
                error: new Error('caboom'),
                result: null
            }
        });

        var error;
        before(function (done) {
            var route = new MetricsRoute(persistence, {metrics: {timespan: 3}});
            var req = mocks.createRequestMock();
            var res = mocks.createResponseMock();

            route.route(req, res, function (_error) {
                error = _error;
                done();
            });
        });

        it('should call loadMetrics', function () {
            expect(persistence.loadMetrics).to.be.calledOnce;
        });

        it('should call next with an eror', function () {
            expect(error.errorCode).to.equal(500);
            expect(error.message).to.equal('caboom');
        });
    });
});