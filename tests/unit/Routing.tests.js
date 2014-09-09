var path = require('path');

var expect = require('chai').use(require('sinon-chai')).expect;

var Injector = require('../../lib/util/di/Injector');
var RoutesLoader = require('../../lib/routing/RoutesLoader');
var mocks = require('../util/mocks');

describe('routing', function() {
    describe('loadRoutes', function() {
        var i, appMock, rl;

        before(function() {
            i = new Injector();
            i.register('foo', 'fooValue');
            i.register('bar', 'barValue');
            appMock = mocks.createAppMock();

            rl = new RoutesLoader(path.join(__dirname, '../testdata/routes'), i)
                .load()
                .mount(appMock);
        });

        it('should', function() {
            expect(appMock.get).to.be.calledWithExactly('/route2', 'route to route1', 'route to route2');
            expect(appMock.get).to.be.calledWithExactly('/route1', 'route to route1');
        });

        it('should have the correct dependencies injected', function() {
            expect(rl._routes.Route1._foo).to.equal('fooValue');
            expect(rl._routes.Route2._bar).to.equal('barValue');
        });
    });

    describe('loadRoutes /w damaged dependencies', function() {
        var i, appMock, rl;

        before(function() {
            i = new Injector();
            appMock = mocks.createAppMock();

            rl = new RoutesLoader(path.join(__dirname, '../testdata/routes'), i);
        });

        it('should throw on unmet dependency', function() {
            expect(function() {
                rl.load();
            }).to.throw('unmet dependency: foo');
        });
    });

    describe('loadRoutes with predecessor error', function() {
        var i, appMock, rl;

        before(function() {
            i = new Injector();
            i.register('foo', 'fooValue');
            i.register('bar', 'barValue');
            appMock = mocks.createAppMock();
            rl = new RoutesLoader(path.join(__dirname, '../testdata/routesFaulty'), i)
                .load();
        });

        it('should throw', function() {
            expect(function() {
                rl.mount(appMock);
            }).to.throw('could not load predecessor: perkins');
        });
    });
});