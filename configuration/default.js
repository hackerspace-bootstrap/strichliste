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
        account: {
            upper: Infinity,
            lower: -50
        },
        transaction: {
            upper: 150,
            lower: -20
        }
    },

    logging: {
        active: true
    }
};