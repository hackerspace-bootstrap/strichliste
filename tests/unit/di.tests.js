var expect = require('chai').use(require('sinon-chai')).expect;
var sinon = require('sinon');

var Injector = require('../../lib/util/di/Injector');

function Problematic(problematic) {}
function Problematic2(notFound) {}

function Foo(bar) {
    this._bar = bar;
}

Foo.prototype.get = function() {
    return this._bar;
};


function Bar(a) {
    this._a = a;
}

Bar.prototype.get = function() {
    return this._a;
};

describe('di', function () {
    describe('injector simple', function() {
        var i, created;

        before(function() {
            i = new Injector();
            i.register('a', {foo: 'bar'});
            i.register('bar', Bar);

            created = i.create('bar');
        });

        it('should return a instance of Bar', function() {
            expect(created).to.be.an.instanceof(Bar);
        });

        it('should inject correctly', function() {
            expect(created.get()).to.deep.equal({foo: 'bar'});
        });
    });

    describe('injector nested', function() {
        var i, created;

        before(function() {
            i = new Injector();
            i.register('foo', Foo);
            i.register('bar', Bar);
            i.register('a', {foo: 'bar'});

            created = i.create('foo');
        });

        it('should return a instance of Foo', function() {
            expect(created).to.be.an.instanceof(Foo);
        });

        it('should inject correctly (firstStep)', function() {
            expect(created.get()).to.be.an.instanceof(Bar);
        });

        it('should inject correctly', function() {
            expect(created.get().get()).to.deep.equal({foo: 'bar'});
        });
    });

    describe('injector cache', function() {
        var i, created;

        before(function() {
            i = new Injector();
            i.register('bar', Bar);
            i.register('a', {foo: 'bar'});

            sinon.spy(i, '_createEntity');

            created = i.create('bar');
            created = i.create('bar');
            created = i.create('bar');
        });

        it('should only create once', function() {
            expect(i._createEntity).to.be.calledOnce;
        });
    });

    describe('circular', function() {
        var i, created;

        before(function() {
            i = new Injector();
            i.register('problematic', Problematic);
        });

        it('should only create once', function() {
            expect(function() {
                created = i.create('problematic');
            }).to.throw('circular dependency detected');
        });
    });

    describe('unmet dependency', function() {
        var i, created;

        before(function() {
            i = new Injector();
            i.register('problematic2', Problematic2);
        });

        it('should only create once', function() {
            expect(function() {
                created = i.create('problematic');
            }).to.throw('unmet dependency: problematic');
        });
    });

    describe('equip', function() {
        var i, created;

        before(function() {
            i = new Injector();
            i.register('a', {foo: 'bar'});

            created = i.equip(Bar);
        });

        it('should be instance of Bar', function() {
            expect(created).to.be.instanceof(Bar);
        });

        it('should be equipped', function() {
            expect(created.get()).to.deep.equal({foo: 'bar'});
        });
    });
});