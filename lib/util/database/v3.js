var seq = require('seq');

function meta(db, callback) {
    console.log('running version 3 migration');

    seq()
        .seq(function() {
            db.query('ALTER TABLE transactions ADD COLUMN comment TEXT', [], this);
        })
        .seq(callback.bind(null, null))
        .catch(callback);

}

module.exports = meta;
