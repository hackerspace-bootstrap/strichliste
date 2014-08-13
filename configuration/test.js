module.exports = {
    database: {
        type: 'SQLITE',
        options: {
            filename: 'testdata.sqlite'
        }
    },
    boundaries: {
        lower: -23,
        upper: 42
    }
};