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
    cena: {
        type: Number,
        required: true
    },
    ptt: Number,
    adresa: {
        type: String,
        required: true
    },
    telefon: {
        type: String,
        required: true
    },
    datum: {
        type: Date,
        index: true,
        default: currentDate,
    },
    napomena: String,
}, { timestamps: true });


const Paket = connection.model('Paket', paketSchema);
module.exports = Paket;