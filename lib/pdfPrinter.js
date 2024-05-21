const PDFDocument = require('pdfkit');
const Paket = require('../models/paket'); // Putanja do vašeg modela


module.exports = async (req, res) => {
    try {
        const userRole = req.user.role;
        let data;
        const doc = new PDFDocument({ margin: 20 }); // Postavljanje margina
        let buffers = [];

        if (userRole === 'admin') {
            data = await Paket.find().exec(); // Povlačenje svih podataka iz kolekcije 'pakets'
        } else if (userRole === 'klijent') {
            const klijent = req.user.username;
            data = await Paket.find({ klijent: klijent }).exec(); // Povlačenje podataka samo za trenutnog klijenta
        } else {
            // Obrada drugih rola ili neovlašćenih korisnika
            res.status(403).send('Unauthorized');
            return;
        }

        // Provera da li je `data` definisan i nije prazan
        if (!data || data.length === 0) {
            res.status(404).send('No packages found');
            return;
        }

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            res
                .writeHead(200, {
                    'Content-Length': Buffer.byteLength(pdfData),
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'attachment; filename=labels.pdf'
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
                .font('Helvetica-Bold')
                .text(`Pošiljalac: ${paket.klijent}`, xPos + 10, yPos + 10, { width: labelWidth - 20, align: 'left' });

            doc.font('Helvetica')
                .fontSize(10)
                .text(`Grad: ${paket.grad || 'N/A'}`, xPos + 10, yPos + 30, { width: labelWidth - 20 })
                .text(`Adresa - Ime i prezime: ${paket.adresa}`, xPos + 10, yPos + 45, { width: labelWidth - 20 })
                .text(`Telefon: ${paket.telefon}`, xPos + 10, yPos + 75, { width: labelWidth - 20 })
                .text(`Ukupna cena: ${paket.cena + paket.ptt} RSD`, xPos + 10, yPos + 90, { width: labelWidth - 20 })
                .text(`Datum: ${paket.datum.toLocaleDateString('sr-RS')}`, xPos + 10, yPos + 105, { width: labelWidth - 20 })
                .text(`Napomena: ${paket.napomena || 'N/A'}`, xPos + 10, yPos + 120, { width: labelWidth - 20 });
        });

        doc.end();
        console.log(`PDF file sent in response!`)
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}