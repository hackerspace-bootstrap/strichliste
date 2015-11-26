function getCurrentDBVersion(db, callback) {
    db.selectOne('select value from meta where key = \'dbVersion\'', [], function(error, row) {

        //the meta table is *not* present which means that there is either no setup at all
        //or the baseline exists. checking this by looking for the number of existing users

        if (error) {
            db.selectOne('select count(*) from users', [], function(error, numberEntries) {
                //pristine, no setup yet
                if (error) {
                    callback(null, 0);
                } else {
                    callback(null, 1);
                }
            });
        } else {
            callback(null, row.value);
        }
    });
}

module.exports = getCurrentDBVersion;