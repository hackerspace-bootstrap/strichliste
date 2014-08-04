module.exports = {
    port: 8080,

    database: {
        type: 'SQLITE',
        options: {
            filename: 'data.sqlite'
        }
    },

    mqtt: {
        enabled: true,
        host: 'localhost',
        port: 1883,
        topics: {
            transactionValue: 'strichliste/transactionValue'
        }
    }
};