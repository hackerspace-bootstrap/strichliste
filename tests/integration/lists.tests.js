var expect = require('chai').expect;
var request = require('supertest');
var sinon = require('sinon');

var database = require('../util/database');

var dbFactory = require('../../lib/database/Factory');
var appFactory = require('../../appFactory');
var configuration = require('../../lib/configuration');

describe('Integration Lists', function () {
    var app, clock, db;

    before(function (done) {
        clock = sinon.useFakeTimers();

        dbFactory.create(configuration.database, function (error, _db) {
            if (error) throw error;

            db = _db;
            database.create2Users5TransactionsDatabase(db, function (error) {
                if (error) throw error;

                appFactory.create(function (error, _app) {
                    if (error) throw error;

                    app = _app;
                    done();
                });
            });
        });
    });

    after(function (done) {
        clock.restore();
        database.clearTables(db, done);
    });

    it('should return two users', function (done) {
        request(app)
            .get('/user')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":2,"limit":null,"offset":null,"entries":[{"id":1,"name":"foo","mailAddress":"fooMail","balance":3,"lastTransaction":"2014-01-01 00:23:44","countOfTransactions":3,"weightedCountOfPurchases":0,"activeDays":1},{"id":2,"name":"bar","mailAddress":"barMail","balance":2,"lastTransaction":"2014-01-01 00:23:46","countOfTransactions":2,"weightedCountOfPurchases":0,"activeDays":1}]}', done);
    });

    it('should return a empty list b/c of limit+offset', function (done) {
        request(app)
            .get('/user?offset=2&limit=1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":2,"limit":1,"offset":2,"entries":[]}', done);
    });

    it('should load a user by id', function (done) {
        request(app)
            .get('/user/1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"id":1,"name":"foo","mailAddress":"fooMail","balance":3,"lastTransaction":"2014-01-01 00:23:44","countOfTransactions":3,"weightedCountOfPurchases":0,"activeDays":1,"transactions":[{"id":3,"userId":1,"createDate":"2014-01-01 00:23:44","value":1,"comment":null},{"id":2,"userId":1,"createDate":"2014-01-01 00:23:43","value":1,"comment":null},{"id":1,"userId":1,"createDate":"2014-01-01 00:23:42","value":1,"comment":null}]}', done);
    });

    it('should return a failure when user does not exist', function (done) {
        request(app)
            .get('/user/10')
            .expect('Content-Type', /application\/json/)
            .expect(404)
            .expect('{"message":"user 10 not found"}', done);
    });

    it('should load the list of transactions, user idependent', function (done) {
        request(app)
            .get('/transaction')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":5,"limit":null,"offset":null,"entries":[{"id":5,"userId":2,"createDate":"2014-01-01 00:23:46","value":1,"comment":null},{"id":4,"userId":2,"createDate":"2014-01-01 00:23:45","value":1,"comment":null},{"id":3,"userId":1,"createDate":"2014-01-01 00:23:44","value":1,"comment":null},{"id":2,"userId":1,"createDate":"2014-01-01 00:23:43","value":1,"comment":null},{"id":1,"userId":1,"createDate":"2014-01-01 00:23:42","value":1,"comment":null}]}', done);
    });

    it('should load the list of user independent transactions, restricted by offset and limit', function (done) {
        request(app)
            .get('/transaction?limit=1&offset=1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":5,"limit":1,"offset":1,"entries":[{"id":4,"userId":2,"createDate":"2014-01-01 00:23:45","value":1,"comment":null}]}', done);
    });

    it('should load the list of transactions', function (done) {
        request(app)
            .get('/user/1/transaction')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":3,"limit":null,"offset":null,"entries":[{"id":3,"userId":1,"createDate":"2014-01-01 00:23:44","value":1,"comment":null},{"id":2,"userId":1,"createDate":"2014-01-01 00:23:43","value":1,"comment":null},{"id":1,"userId":1,"createDate":"2014-01-01 00:23:42","value":1,"comment":null}]}', done);
    });

    it('should load a single transaction', function (done) {
        request(app)
            .get('/user/1/transaction/1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"id":1,"userId":1,"createDate":"2014-01-01 00:23:42","value":1,"comment":null}', done);
    });

    it('should return a restricted list of transactions (limit=1)', function (done) {
        request(app)
            .get('/user/1/transaction?limit=1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":3,"limit":1,"offset":0,"entries":[{"id":3,"userId":1,"createDate":"2014-01-01 00:23:44","value":1,"comment":null}]}', done);
    });

    it('should return a restricted list of transactions (offset=1&limit=1)', function (done) {
        request(app)
            .get('/user/1/transaction?limit=1&offset=1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":3,"limit":1,"offset":1,"entries":[{"id":2,"userId":1,"createDate":"2014-01-01 00:23:43","value":1,"comment":null}]}', done);
    });

    it('should report metrics', function (done) {
        request(app)
            .get('/metrics')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .end(function (error, result) {
                if (error) throw error;

                expect(result.body).to.deep.equal({
                    countTransactions: 5,
                    overallBalance: 5,
                    countUsers: 2,
                    avgBalance: 2.5,
                    days: [
                        {
                            date: '1969-12-29',
                            overallNumber: 0,
                            distinctUsers: 0,
                            dayBalance: 0,
                            dayBalancePositive: 0,
                            dayBalanceNegative: 0
                        }, {
                            date: '1969-12-30',
                            overallNumber: 0,
                            distinctUsers: 0,
                            dayBalance: 0,
                            dayBalancePositive: 0,
                            dayBalanceNegative: 0
                        }, {
                            date: '1969-12-31',
                            overallNumber: 0,
                            distinctUsers: 0,
                            dayBalance: 0,
                            dayBalancePositive: 0,
                            dayBalanceNegative: 0
                        }, {
                            date: '1970-01-01',
                            overallNumber: 0,
                            distinctUsers: 0,
                            dayBalance: 0,
                            dayBalancePositive: 0,
                            dayBalanceNegative: 0
                        }
                    ]
                });

                done();
            });
    });
});
