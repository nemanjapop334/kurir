const mongoose = require('mongoose');
const connection = require('../lib/dbconnection');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    hash: String,
    salt: String,
    role: {
        type: String,
        required: true
    },
    ptt: Number,
});

const User = connection.model('User', UserSchema);

module.exports = User;