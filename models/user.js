const mongoose = require('mongoose');
const connection = require('../dbconnection');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    hash: String,
    salt: String,
    admin: Boolean
});

const User = connection.model('User', UserSchema);

module.exports = User;