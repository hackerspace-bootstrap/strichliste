var expect = require('chai').expect;

var mocks = require('../util/mocks');
var parameterMiddleware = require('../../lib/parameters/middleware');

describe('parameters', function () {
    describe('middleware', function () {
        describe('empty parameters', function() {
            var reqMock = mocks.createRequestMock({ query: {} });
            var resMock = mocks.createResponseMock();

            before(function(done) {
                parameterMiddleware()(reqMock, resMock, done);
            });

            it('should not create a orderStatement', function() {
                expect(reqMock.strichliste.orderStatement).to.be.null;
            });

            it('should not create a limitStatement', function() {
                expect(reqMock.strichliste.limitStatement).to.be.null;
            });
        });

        describe('limit parameter', function() {
            var reqMock = mocks.createRequestMock({ query: { limit: 10 } });
            var resMock = mocks.createResponseMock();

            before(function(done) {
                parameterMiddleware()(reqMock, resMock, done);
            });

            it('should not create a orderStatement', function() {
                expect(reqMock.strichliste.orderStatement).to.be.null;
            });

            it('should create a limitStatement', function() {
                expect(reqMock.strichliste.limitStatement.limit()).to.equal(10);
                expect(reqMock.strichliste.limitStatement.offset()).to.equal(0);
            });
        });

        describe('offset parameter', function() {
            var reqMock = mocks.createRequestMock({ query: { offset: 10 } });
            var resMock = mocks.createResponseMock();

            before(function(done) {
                parameterMiddleware()(reqMock, resMock, done);
            });

            it('should not create a orderStatement', function() {
                expect(reqMock.strichliste.orderStatement).to.be.null;
            });

            it('should create a limitStatement', function() {
                expect(reqMock.strichliste.limitStatement).to.be.null;
            });
        });

        describe('limit+offset parameter', function() {
            var reqMock = mocks.createRequestMock({ query: { limit: 42, offset: 1337 } });
            var resMock = mocks.createResponseMock();

            before(function(done) {
                parameterMiddleware()(reqMock, resMock, done);
            });

            it('should not create a orderStatement', function() {
                expect(reqMock.strichliste.orderStatement).to.be.null;
            });

            it('should create a limitStatement', function() {
                expect(reqMock.strichliste.limitStatement.limit()).to.equal(42);
                expect(reqMock.strichliste.limitStatement.offset()).to.equal(1337);
            });
        });

        describe('limit+offset parameter', function() {
            var reqMock = mocks.createRequestMock({ query: { limit: 'foo', offset: 'foo' } });
            var resMock = mocks.createResponseMock();

            before(function(done) {
                parameterMiddleware()(reqMock, resMock, done);
            });

            it('should create not a orderStatement', function() {
                expect(reqMock.strichliste.orderStatement).to.be.null;
            });

            it('should create a limitStatement', function() {
                expect(reqMock.strichliste.limitStatement).to.be.null;
            });
        });

        describe('limit+offset parameter', function() {
            var reqMock = mocks.createRequestMock({ query: { limit: 1, offset: 'foo' } });
            var resMock = mocks.createResponseMock();

            before(function(done) {
                parameterMiddleware()(reqMock, resMock, done);
            });

            it('should create not a orderStatement', function() {
                expect(reqMock.strichliste.orderStatement).to.be.null;
            });

            it('should create a limitStatement', function() {
                expect(reqMock.strichliste.limitStatement.limit()).to.equal(1);
                expect(reqMock.strichliste.limitStatement.offset()).to.equal(0);
            });
        });

        describe('order parameter (asc)', function() {
            var reqMock = mocks.createRequestMock({ query: { order: 'foo' } });
            var resMock = mocks.createResponseMock();

            before(function(done) {
                parameterMiddleware()(reqMock, resMock, done);
            });

            it('should create a orderStatement', function() {
                expect(reqMock.strichliste.orderStatement.field()).to.equal('foo');
                expect(reqMock.strichliste.orderStatement.direction()).to.equal('asc');
            });

            it('should not create a limitStatement', function() {
                expect(reqMock.strichliste.limitStatement).to.be.null;
            });
        });

        describe('order parameter (desc)', function() {
            var reqMock = mocks.createRequestMock({ query: { order: '-foo' } });
            var resMock = mocks.createResponseMock();

            before(function(done) {
                parameterMiddleware()(reqMock, resMock, done);
            });

            it('should create a orderStatement', function() {
                expect(reqMock.strichliste.orderStatement.field()).to.equal('foo');
                expect(reqMock.strichliste.orderStatement.direction()).to.equal('desc');
            });

            it('should not create a limitStatement', function() {
                expect(reqMock.strichliste.limitStatement).to.be.null;
            });
        });
    });
});