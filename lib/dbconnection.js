const mongoose = require('mongoose');

require('dotenv').config();

connection = mongoose.createConnection(process.env.DB_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

module.exports = connection;