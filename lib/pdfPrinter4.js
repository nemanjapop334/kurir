const PDFDocument = require('pdfkit');
const path = require('path');
const currentDate = require('./currentDate');
const Paket = require('../models/paket');
const { ensurePdfAccess } = require('./pdfClient');

// Kao pdfPrinter2 (samo ukupna cena), ali 4 adresnice po A4
module.exports = async (req, res) => {
    try {
        if (!ensurePdfAccess(req, res, 'pdf4')) {
            return;
        }

        const phone = req.user.phone;

        const desiredDate = currentDate();
        const day = desiredDate.getDate();
        const month = desiredDate.getMonth() + 1;
        const year = desiredDate.getFullYear();

        let data;
        const doc = new PDFDocument({ margin: 20 });
        let buffers = [];

        const fontPathArial_bold = path.join(__dirname, '../fonts/ArialBold.ttf');
        const fontPathArial = path.join(__dirname, '../fonts/Arial.ttf');
        doc.registerFont('ArialBold', fontPathArial_bold);
        doc.registerFont('Arial', fontPathArial);

        const klijent = req.user.username;
        data = await Paket.find({ klijent: klijent }).exec();

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

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // 4 adresnice: 2 kolone x 2 reda
        const labelWidth = (pageWidth - 60) / 2;
        const labelHeight = (pageHeight - 60) / 2;
        let xPos, yPos;

        data.forEach((paket, index) => {
            xPos = doc.page.margins.left + (index % 2) * (labelWidth + 20);
            yPos = doc.page.margins.top + Math.floor((index % 4) / 2) * (labelHeight + 20);

            if (index !== 0 && index % 4 === 0) {
                doc.addPage();
            }

            doc.rect(xPos, yPos, labelWidth, labelHeight).stroke();

            const contentWidth = labelWidth - 20;
            const bottomY = yPos + labelHeight - 10;
            const fieldGap = 8;
            let y = yPos + 14;

            const placeField = (text, fontSize, fontName) => {
                doc.fontSize(fontSize).font(fontName);
                const opts = { width: contentWidth, lineGap: 1 };
                const height = doc.heightOfString(text, opts);
                doc.text(text, xPos + 10, y, opts);
                y += height + fieldGap;
            };

            placeField(`Pošiljalac: ${paket.klijent}`, 16, 'ArialBold');
            placeField(`Kontakt pošiljaoca: ${phone || ''}`, 14, 'Arial');
            placeField(`Grad: ${paket.grad || ''}`, 14, 'Arial');
            placeField(`Adresa - Ime i prezime: ${paket.adresa}`, 14, 'Arial');
            placeField(`Telefon: ${paket.telefon}`, 16, 'ArialBold');
            placeField(`Ukupna cena: ${paket.cena + paket.ptt} RSD`, 14, 'ArialBold');
            placeField(`Datum: ${paket.datum.toLocaleDateString('sr-RS')}`, 13, 'Arial');

            const noteText = `Napomena: ${paket.napomena || ''}`;
            const noteMaxHeight = bottomY - y;

            if (noteMaxHeight > 0) {
                doc.fontSize(13).font('Arial');
                const noteOptions = { width: contentWidth, height: noteMaxHeight, lineGap: 1 };
                const noteHeight = doc.heightOfString(noteText, noteOptions);

                if (noteHeight > noteMaxHeight) {
                    const maxLines = Math.max(1, Math.floor(noteMaxHeight / doc.currentLineHeight()));
                    const words = noteText.split(' ');
                    let shortenedText = '';
                    let lineCount = 0;

                    for (let i = 0; i < words.length; i++) {
                        const testLine = `${shortenedText}${words[i]} `;
                        if (doc.heightOfString(testLine, noteOptions) > doc.currentLineHeight()) {
                            lineCount++;
                            if (lineCount >= maxLines) {
                                shortenedText += '...';
                                break;
                            }
                        }
                        shortenedText += `${words[i]} `;
                    }

                    doc.text(shortenedText.trim(), xPos + 10, y, noteOptions);
                } else {
                    doc.text(noteText, xPos + 10, y, noteOptions);
                }
            }
        });

        doc.end();
        console.log('PDF file sent in response!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
