const PDFDocument = require('pdfkit');
const path = require('path');
const currentDate = require('./currentDate');
const Paket = require('../models/paket');
const { ensurePdfAccess, getPdf3Client } = require('./pdfClient');

const SENDER_ADDRESS = 'Gorana Šolajića 9';
const SENDER_CITY = 'Stari Banovci';

module.exports = async (req, res) => {
    try {
        if (!ensurePdfAccess(req, res, 'pdf3')) {
            return;
        }

        const phone = req.user.phone;
        const PDF3_CLIENT = getPdf3Client();

        const desiredDate = currentDate();
        const day = desiredDate.getDate();
        const month = desiredDate.getMonth() + 1;
        const year = desiredDate.getFullYear();

        const data = await Paket.find({ klijent: PDF3_CLIENT }).exec();
        const doc = new PDFDocument({ margin: 20 });
        let buffers = [];

        const fontPathArial_bold = path.join(__dirname, '../fonts/ArialBold.ttf');
        const fontPathArial = path.join(__dirname, '../fonts/Arial.ttf');
        doc.registerFont('ArialBold', fontPathArial_bold);
        doc.registerFont('Arial', fontPathArial);

        if (!data || data.length === 0) {
            req.flash('info', 'Niste uneli ni jednu pošiljku! Nema pošiljaka za štampu!');
            res.redirect('/paket').status(404);
            return;
        }

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
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
        const labelWidth = (pageWidth - 60) / 2;
        const labelHeight = (pageHeight - 80) / 3;
        const padding = 10;
        const contentWidth = labelWidth - padding * 2;
        const lineGap = -2;

        data.forEach((paket, index) => {
            const xPos = doc.page.margins.left + (index % 2) * (labelWidth + 20);
            const yPos = doc.page.margins.top + Math.floor((index % 6) / 2) * (labelHeight + 20);

            if (index !== 0 && index % 6 === 0) {
                doc.addPage();
            }

            doc.rect(xPos, yPos, labelWidth, labelHeight).stroke();

            const bottomY = yPos + labelHeight - padding;
            const dividerPadding = 4;
            let y = yPos + padding;

            const drawDivider = (lineY) => {
                doc.save();
                doc.strokeColor('#000000');
                doc.lineWidth(0.5);
                doc.moveTo(xPos + padding, lineY)
                    .lineTo(xPos + labelWidth - padding, lineY)
                    .stroke();
                doc.restore();
            };

            const advance = (height = doc.currentLineHeight() + lineGap) => {
                y += height;
            };

            doc.fontSize(10).font('ArialBold')
                .text(`Pošiljalac: ${PDF3_CLIENT}`, xPos + padding, y, { width: contentWidth, lineGap });
            advance(11);

            doc.fontSize(9).font('Arial')
                .text(SENDER_ADDRESS, xPos + padding, y, { width: contentWidth, lineGap });
            advance(11);

            doc.text(SENDER_CITY, xPos + padding, y, { width: contentWidth, lineGap });
            advance(11);

            doc.text(`Kontakt pošiljaoca: ${phone || ''}`, xPos + padding, y, { width: contentWidth, lineGap });
            y += doc.currentLineHeight() + lineGap + dividerPadding;

            drawDivider(y);
            y += 6;

            const fieldGap = 5;
            const placeField = (text, fontSize, fontName) => {
                doc.fontSize(fontSize).font(fontName);
                const opts = { width: contentWidth, lineGap };
                const height = doc.heightOfString(text, opts);
                doc.text(text, xPos + padding, y, opts);
                y += height + fieldGap;
            };

            placeField(`Grad: ${paket.grad || ''}`, 9, 'Arial');
            placeField(`Adresa - Ime i prezime: ${paket.adresa || ''}`, 9, 'Arial');
            placeField(`Telefon: ${paket.telefon}`, 10, 'ArialBold');
            placeField(`Ukupna cena: ${paket.cena + paket.ptt} RSD`, 10, 'ArialBold');
            placeField(`Datum: ${paket.datum.toLocaleDateString('sr-RS')}`, 9, 'Arial');

            const noteText = `Napomena: ${paket.napomena || ''}`;
            const noteHeight = bottomY - y;

            if (noteHeight > 0) {
                doc.fontSize(8).font('Arial');
                doc.text(noteText, xPos + padding, y, { width: contentWidth, height: noteHeight, lineGap });
            }
        });

        doc.end();
        console.log('PDF file sent in response!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};
