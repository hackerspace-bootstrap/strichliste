var seq = require('seq');

function commentColumn(db, callback) {
    console.log('running version 3 migration');

    seq()
        .seq(function() {
            db.query('ALTER TABLE transactions ADD COLUMN comment TEXT', [], this);
        })
        .seq(function() {
            db.query('UPDATE meta SET value=3 WHERE key=\'dbVersion\'', [], this);
        })
        .seq(callback.bind(null, null))
        .catch(callback);

}

module.exports = commentColumn;
