var expect = require('chai').expect;
var request = require('supertest');
var express = require('express');

var database = require('../util/database');

var appFactory = require('../../appFactory');
var configuration = require('../../lib/configuration');

describe('List tests', function () {
    var app;
    before(function (done) {
        database.create2Users5TransactionsDatabase(configuration.database, function (error) {
            if (error) throw error;

            appFactory.create(function (error, _app) {
                if (error) throw error;

                app = _app;
                done();
            });
        });
    });

    it('should return two users', function (done) {
        request(app)
            .get('/user')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":2,"limit":null,"offset":null,"entries":[{"id":1,"name":"foo","balance":3,"lastTransaction":"2014-01-01 00:23:44"},{"id":2,"name":"bar","balance":2,"lastTransaction":"2014-01-01 00:23:46"}]}', done);
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
            .expect('{"id":1,"name":"foo","balance":3,"lastTransaction":"2014-01-01 00:23:44","transactions":[{"id":3,"userId":1,"createDate":"2014-01-01 00:23:44","value":1},{"id":2,"userId":1,"createDate":"2014-01-01 00:23:43","value":1},{"id":1,"userId":1,"createDate":"2014-01-01 00:23:42","value":1}]}', done);
    });

    it('should return a failure when user does not exist', function (done) {
        request(app)
            .get('/user/10')
            .expect('Content-Type', /application\/json/)
            .expect(404)
            .expect('{"message":"user 10 not found"}', done);
    });

    it('should load the list of transactions', function (done) {
        request(app)
            .get('/user/1/transaction')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":3,"limit":null,"offset":null,"entries":[{"id":3,"userId":1,"createDate":"2014-01-01 00:23:44","value":1},{"id":2,"userId":1,"createDate":"2014-01-01 00:23:43","value":1},{"id":1,"userId":1,"createDate":"2014-01-01 00:23:42","value":1}]}', done);
    });

    it('should load a single transaction', function (done) {
        request(app)
            .get('/user/1/transaction/1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"id":1,"userId":1,"createDate":"2014-01-01 00:23:42","value":1}', done);
    });

    it('should return a restricted list of transactions (limit=1)', function (done) {
        request(app)
            .get('/user/1/transaction?limit=1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":3,"limit":1,"offset":0,"entries":[{"id":3,"userId":1,"createDate":"2014-01-01 00:23:44","value":1}]}', done);
    });

    it('should return a restricted list of transactions (offset=1&limit=1)', function (done) {
        request(app)
            .get('/user/1/transaction?limit=1&offset=1')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"overallCount":3,"limit":1,"offset":1,"entries":[{"id":2,"userId":1,"createDate":"2014-01-01 00:23:43","value":1}]}', done);
    });

    it('should report metrics', function (done) {
        request(app)
            .get('/metrics')
            .expect('Content-Type', /application\/json/)
            .expect(200)
            .expect('{"countTransactions":5,"overallBalance":5,"countUsers":2,"avgBalance":2.5,"days":[]}', done);
    });
});