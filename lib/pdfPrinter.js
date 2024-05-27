const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const currentDate = require('./currentDate');
const Paket = require('../models/paket');

module.exports = async (req, res) => {
    try {

        phone = req.user.phone;

        const desiredDate = currentDate();
        const day = desiredDate.getDate();
        const month = desiredDate.getMonth() + 1; // Months are zero-based, so add 1
        const year = desiredDate.getFullYear();

        const userRole = req.user.role;
        let data;
        const doc = new PDFDocument({ margin: 20 }); //  Margine set
        let buffers = [];

        // Get fonts
        const fontPathDejaVuLGCSans_bold = path.join(__dirname, '../fonts/DejaVuLGCSans-Bold.ttf');
        const fontPathDejaVuLGCSans = path.join(__dirname, '../fonts/DejaVuLGCSans.ttf');
        doc.registerFont('DejaVuSans-Bold', fontPathDejaVuLGCSans_bold);
        doc.registerFont('DejaVuSans', fontPathDejaVuLGCSans);

        if (userRole === 'admin') {
            data = await Paket.find().exec(); // Download all data from collection 'pakets'
        } else if (userRole === 'klijent') {
            const klijent = req.user.username;
            data = await Paket.find({ klijent: klijent }).exec(); // Download data for user in session from collection 'pakets'
        } else {
            res.status(403).send('Unauthorized');
            return;
        }

        // Check if data is not empty
        if (!data || data.length === 0) {
            req.flash('info', 'Niste uneli ni jednu pošiljku! Nema pošiljaka za štampu!');
            res.redirect('/paket').status(404);
            return;
        }

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            res
                .writeHead(200, {
                    'Content-Length': Buffer.byteLength(pdfData),
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename=Adresnice ${day}-${month}-${year}.pdf`
                })
                .end(pdfData);
        });

        // Dimenzije A4 papira u PDFKit jedinicama (1 jedinica = 1/72 inča)
        // Dimensions of A4 paper in PDFKit units (1 unit = 1/72 inch)
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Dimenzije adresnica
        // Dimensions of address labels
        const labelWidth = (pageWidth - 60) / 2; // Širina adresnice (sa 20 jedinica margine sa obe strane)  Width of the address label (with 20 units margin on both sides)
        const labelHeight = (pageHeight - 80) / 4; // Visina adresnice (sa 20 jedinica margine gore i dole)  Height of the address label (with 20 units top and bottom)
        let xPos, yPos;

        data.forEach((paket, index) => {
            // Pozicija adresnice na stranici - Position of the adress label
            xPos = doc.page.margins.left + (index % 2) * (labelWidth + 20); // Alternira između dve kolone - Alternates between two collons
            yPos = doc.page.margins.top + Math.floor((index % 8) / 2) * (labelHeight + 20); // Pomeranje po redovima - Moving by raws

            // Ako se pređe broj 8, dodaje se nova stranica - If cross 8 address labels add page
            if (index !== 0 && index % 8 === 0) {
                doc.addPage();
            }

            doc.rect(xPos, yPos, labelWidth, labelHeight).stroke(); // Crtanje okvira adresnice - Drawing border lines around address label

            doc.fontSize(12)
                .font('DejaVuSans-Bold')
                .text(`Pošiljalac: ${paket.klijent}`, xPos + 10, yPos + 10, { width: labelWidth - 20, align: 'left' })
                .text(`Telefon: ${paket.telefon}`, xPos + 10, yPos + 90, { width: labelWidth - 20 });

            doc.font('DejaVuSans')
                .fontSize(10)
                .text(`Grad: ${paket.grad || 'N/A'}`, xPos + 10, yPos + 45, { width: labelWidth - 20 })
                .text(`Kontakt pošiljaoca: ${phone || 'N/A'}`, xPos + 10, yPos + 30, { width: labelWidth - 20 })
                .text(`Adresa - Ime i prezime: ${paket.adresa}`, xPos + 10, yPos + 60, { width: labelWidth - 20 })

                .text(`Ukupna cena: ${paket.cena + paket.ptt} RSD`, xPos + 10, yPos + 105, { width: labelWidth - 20 })
                .text(`Datum: ${paket.datum.toLocaleDateString('sr-RS')}`, xPos + 10, yPos + 120, { width: labelWidth - 20 })
                .text(`Napomena: ${paket.napomena || 'N/A'}`, xPos + 10, yPos + 135, { width: labelWidth - 20 });
        });

        doc.end();
        console.log(`PDF file sent in response!`)
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}