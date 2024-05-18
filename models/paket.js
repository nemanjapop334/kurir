const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connection = require('../lib/dbconnection');
const currentDate = require('../lib/currentDate');


const paketSchema = new Schema({
    klijent: {
        type: String,
        index: true,
        required: true
    },
    grad: String,
    adresa: {
        type: String,
        required: true
    },
    telefon: {
        type: String,
        required: true
    },
    cena: {
        type: Number,
        required: true
    },
    datum: {
        type: Date,
        index: true,
        default: currentDate(),
    },
    ptt: Number,
    napomena: String,
    expiresAt: {
        type: Date,
        // Set the default expiration date to 7 days from the current date
        default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000),
    },
}, { timestamps: true });


const Paket = connection.model('Paket', paketSchema);
module.exports = Paket;