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
            upper: 150,
            lower: -20
        }
    }
};