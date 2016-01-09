var once = require('once');
var seq = require('seq');

var Factory = require('../database/Factory');

/*
    VERSIONS

    0: the database has not been initialized yet
    1: the initial state:
       the user and the transaction table is present
    2: adds a meta table which in the future holds the database version
       adds the email field to the users table

 */

var v1 = require('./database/v1');
var v2 = require('./database/v2');
var getCurrentVersion = require('./database/getCurrentDBVersion');

var versions = [v1, v2];

module.exports = function (configuration, callback) {
    Factory.create(configuration, function (error, db) {
        if (error) return callback(error);

        getCurrentVersion(db, function(error, version) {
            if (error) {
                return callback(error);
            }

            console.log('current version: ' + version);

            var updateTrack = versions.slice(version);

            var chain = seq();

            if (updateTrack.length > 0) {
                updateTrack.forEach(function(version) {
                    chain.seq(function() {
                        version(db, this);
                    });
                });

                chain
                    .seq(callback.bind(null,null))
                    .catch(callback)
            } else {
                console.log('no version updates necessary!');
                callback(null);
            }
        });
    });
};