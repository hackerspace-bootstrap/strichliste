module.exports = {
    database: {
        type: 'SQLITE',
        options: {
            filename: 'testdata.sqlite'
        }
    },
    boundaries: {
        account: {
            lower: -23,
            upper: 42
        },
        transaction: {
            upper: 9999,
            lower: -9999
        }
    },

    logging: {
        active: false
    }
};