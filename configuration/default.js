module.exports = {
    host: '0.0.0.0',
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
        account: {
            upper: 99999999,
            lower: -50
        },
        transaction: {
            upper: 150,
            lower: -20
        }
    },

    logging: {
        active: true
    },

    caching: {
        enabled: false
    },

    metrics: {
        timespan: 30
    }
};
