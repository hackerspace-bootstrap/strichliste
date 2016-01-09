var seq = require('seq');

function meta(db, callback) {
    console.log('running version 2 migration');

    seq()
        .seq(function() {
            db.query('CREATE TABLE meta (key text PRIMARY KEY, value text)', [], this);
        })
        .seq(function() {
            db.query('INSERT INTO meta (key, value) VALUES (\'dbVersion\', 2)', [], this);
        })
        .seq(function() {
            db.query('ALTER TABLE users ADD COLUMN active INTEGER DEFAULT 1', [], this);
        })
        .seq(function() {
            db.query('ALTER TABLE users ADD COLUMN mailAddress text', [], this);
        })
        .seq(callback.bind(null, null))
        .catch(callback);

}

module.exports = meta;