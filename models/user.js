const mongoose = require('mongoose');
const connection = require('../lib/dbconnection');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    hash: String,
    salt: String,
    role: {
        type: String,
        required: true
    },
    pttBG: Number,
    pttNS: Number,
    pttPA: Number,
});

const User = connection.model('User', UserSchema);

module.exports = User;