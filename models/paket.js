const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connection = require('../dbconnection');



const paketSchema = new Schema({
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
    }
});

const Paket = connection.model('Paket', paketSchema);
module.exports = Paket;