var expect = require('chai').expect;
var request = require('supertest');

var database = require('../util/database');

var dbFactory = require('../../lib/database/Factory');
var appFactory = require('../../appFactory');
var configuration = require('../../lib/configuration');

describe('Integration creation', function () {
    var app, db;
    before(function (done) {
        dbFactory.create(configuration.database, function(error, _db) {
            if (error) throw error;

            db = _db;
            database.createPlainDatabase(db, function (error) {
                if (error) throw error;

                appFactory.create(function (error, _app) {
                    if (error) throw error;

                    app = _app;
                    done();
                });
            });
        });
    });

    after(function(done) {
        database.clearTables(db, done);
    });

    it('should return the app settings', function (done) {
        request(app)
            .get('/settings')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"boundaries":{"upper":42,"lower":-23}}', done);
    });

    it('should return an empty list', function (done) {
        request(app)
            .get('/user')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":0,"limit":null,"offset":null,"entries":[]}', done);
    });

    it('should create a user', function (done) {
        request(app)
            .post('/user')
            .send({name: 'bert', mailAddress: 'bertMail'})
            .expect('Content-Type', /application\/json/)
            .expect(201)
            .expect('{"id":1,"name":"bert","mailAddress":"bertMail","balance":0,"lastTransaction":null,"countOfTransactions":0,"weightedCountOfPurchases":null,"activeDays":0}', done);
    });

    it('create should fail without a name', function (done) {
        request(app)
            .post('/user')
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .expect('{"message":"name missing"}', done);
    });

    it('create should fail when the name already exists', function (done) {
        request(app)
            .post('/user')
            .send({name: 'bert'})
            .expect('Content-Type', /application\/json/)
            .expect(409)
            .expect('{"message":"user bert already exists"}', done);
    });

    it('should return a empty list of transactions', function (done) {
        request(app)
            .get('/user/1/transaction')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":0,"limit":null,"offset":null,"entries":[]}', done);
    });

    it('transaction create should fail when value is not a number', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 'foo'})
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .expect('{"message":"not a number: foo"}', done);
    });

    it('transaction create should fail when value is zero', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 0})
            .expect('Content-Type', /application\/json/)
            .expect(400)
            .expect('{"message":"value must not be zero"}', done);
    });

    it('should create a transaction', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 11})
            .expect('Content-Type', /application\/json/)
            .expect(201)
            .expect(/{"id":1,"userId":1,"createDate":"(.*)","value":11,"comment":null}/, done);
    });

    it('should create a second transaction', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 11})
            .expect('Content-Type', /application\/json/)
            .expect(201)
            .expect(/{"id":2,"userId":1,"createDate":"(.*)","value":11,"comment":null}/, done);
    });

    it('should fail the transaction creation with 403 (lower account boundary error)', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: -100})
            .expect('Content-Type', /application\/json/)
            .expect(403)
            .expect('{"message":"transaction value of -100 leads to an overall account balance of -78 which goes below the lower account limit of -23"}', done);
    });

    it('should fail the transaction creation with 403 (upper account boundary error)', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 100})
            .expect('Content-Type', /application\/json/)
            .expect(403)
            .expect('{"message":"transaction value of 100 leads to an overall account balance of 122 which goes beyond the upper account limit of 42"}', done);
    });

    it('should fail the transaction creation with 403 (upper transaction boundary error)', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: 99999})
            .expect('Content-Type', /application\/json/)
            .expect(403)
            .expect('{"message":"transaction value of 99999 exceeds the transaction maximum of 9999"}', done);
    });

    it('should fail the transaction creation with 403 (lower transaction boundary error)', function (done) {
        request(app)
            .post('/user/1/transaction')
            .send({value: -99999})
            .expect('Content-Type', /application\/json/)
            .expect(403)
            .expect('{"message":"transaction value of -99999 falls below the transaction minimum of -9999"}', done);
    });

    it('should not fail when invalid json is posted to the api', function (done) {
        request(app)
            .post('/user/1/transaction')
            .set('Content-Type', 'application/json')
            .send('{"name": }')
            .expect('Content-Type', /application\/json/)
            .expect(400, done);
    });
});
