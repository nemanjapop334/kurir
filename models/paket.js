const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const connection = require('../lib/dbconnection');



const paketSchema = new Schema({
    klijent: {
        type: String,
        index: true,
    },
    grad: String,
    imeprezime: {
        type: String,
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
        default: function () {
            // Postavi datum na sutrašnji dan ako trenutno vreme prelazi podne
            const today = new Date();
            const currentHour = today.getHours();
            const cutoffHour = 12; // Postavljanje vremena preseka na podne

            // Ako je trenutno vreme pre podne, ostavi datum na današnji dan
            if (currentHour < cutoffHour) {
                return today;
            }

            // Ako je trenutno vreme posle podne, postavi datum na sutrašnji dan
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            return tomorrow;
        },
    },
    ptt: Number,
    napomena: String,
    expiresAt: {
        type: Date,
        // Set the default expiration date to one month from the current date
        default: () => new Date(+new Date() + 7 * 24 * 60 * 60 * 1000),
    },
}, { timestamps: true });


const Paket = connection.model('Paket', paketSchema);
module.exports = Paket;