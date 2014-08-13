module.exports = {
    port: 8080,

    database: {
        type: 'SQLITE',
        options: {
            filename: 'data.sqlite'
        }
    },

    mqtt: {
        enabled: false,
        host: 'localhost',
        port: 1883,
        topics: {
            transactionValue: 'strichliste/transactionValue'
        }
    },

    boundaries: {
        upper: Infinity,
        lower: -50
    }
};