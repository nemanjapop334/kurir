const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connection = require('../lib/dbconnection');



const paketSchema = new Schema({
    klijent: String,
    imeprezime: {
        type: String,
        required: true
    },
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
        default: Date.now,
    },
    ptt: Number,
});

const Paket = connection.model('Paket', paketSchema);
module.exports = Paket;