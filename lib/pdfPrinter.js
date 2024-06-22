const PDFDocument = require('pdfkit');
const path = require('path');
const currentDate = require('./currentDate');
const Paket = require('../models/paket');

module.exports = async (req, res) => {
    try {

        const phone = req.user.phone;

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
        const fontPathArial_bold = path.join(__dirname, '../fonts/ArialBold.ttf');
        const fontPathArial = path.join(__dirname, '../fonts/Arial.ttf');
        doc.registerFont('ArialBold', fontPathDejaVuLGCSans_bold);
        doc.registerFont('Arial', fontPathDejaVuLGCSans);

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
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Dimenzije adresnica
        const labelWidth = (pageWidth - 60) / 2; // Širina adresnice (sa 20 jedinica margine sa obe strane)
        const labelHeight = (pageHeight - 80) / 4; // Visina adresnice (sa 20 jedinica margine gore i dole)
        let xPos, yPos;

        data.forEach((paket, index) => {
            // Pozicija adresnice na stranici
            xPos = doc.page.margins.left + (index % 2) * (labelWidth + 20); // Alternira između dve kolone
            yPos = doc.page.margins.top + Math.floor((index % 8) / 2) * (labelHeight + 20); // Pomeranje po redovima

            // Ako se pređe broj 8, dodaje se nova stranica
            if (index !== 0 && index % 8 === 0) {
                doc.addPage();
            }

            doc.rect(xPos, yPos, labelWidth, labelHeight).stroke(); // Crtanje okvira adresnice

            doc.fontSize(12)
                .font('ArialBold')
                .text(`Pošiljalac: ${paket.klijent}`, xPos + 10, yPos + 10, { width: labelWidth - 20, align: 'left' })
                .text(`Telefon: ${paket.telefon}`, xPos + 10, yPos + 90, { width: labelWidth - 20 });

            doc.font('Arial')
                .fontSize(10)
                .text(`Grad: ${paket.grad || 'N/A'}`, xPos + 10, yPos + 45, { width: labelWidth - 20 })
                .text(`Kontakt pošiljaoca: ${phone || 'N/A'}`, xPos + 10, yPos + 30, { width: labelWidth - 20 })
                .text(`Adresa - Ime i prezime: ${paket.adresa}`, xPos + 10, yPos + 60, { width: labelWidth - 20 })
                .text(`Ukupna cena: ${paket.cena + paket.ptt} RSD`, xPos + 10, yPos + 105, { width: labelWidth - 20 })
                .text(`Datum: ${paket.datum.toLocaleDateString('sr-RS')}`, xPos + 10, yPos + 120, { width: labelWidth - 20 });

            // Automatsko prelamanje i kontrola visine teksta za napomenu
            const noteText = `Napomena: ${paket.napomena || 'N/A'}`;
            const noteOptions = { width: labelWidth - 20, height: labelHeight - 135 };
            const noteHeight = doc.heightOfString(noteText, noteOptions);

            if (noteHeight > labelHeight - 135) {
                // Skrati napomenu ako je predugačka
                const maxLines = Math.floor((labelHeight - 135) / doc.currentLineHeight());
                const words = noteText.split(' ');
                let shortenedText = '';
                let lineCount = 0;

                for (let i = 0; i < words.length; i++) {
                    const testLine = shortenedText + words[i] + ' ';
                    const testHeight = doc.heightOfString(testLine, noteOptions);

                    if (testHeight > doc.currentLineHeight()) {
                        lineCount++;
                        if (lineCount >= maxLines) {
                            shortenedText += '...';
                            break;
                        }
                    }
                    shortenedText += words[i] + ' ';
                }

                doc.text(shortenedText, xPos + 10, yPos + 135, noteOptions);
            } else {
                doc.text(noteText, xPos + 10, yPos + 135, noteOptions);
            }
        });

        doc.end();
        console.log(`PDF file sent in response!`)
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}
