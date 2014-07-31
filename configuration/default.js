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
        host: 'mqtt',
        port: 1882,
        topics: {
            transactionValue: 'strichliste/transactionValue'
        }
    }
};