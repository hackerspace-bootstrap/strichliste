module.exports = {
    port: 8080,

    database: {
        type: 'SQLITE',
        options: {
            filename: 'data.sqlite'
        }
    },

    mqtt: {
        enable: false,
        host: 'mqtt',
        port: 1882,
        topics: {
            transaction: 'strichliste/transaction'
        }
    }
};