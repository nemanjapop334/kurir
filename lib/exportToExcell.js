const ExcelJS = require('exceljs');
const Paket = require('../models/paket');
const currentDate = require('./currentDate');

module.exports = async (req, res) => {
    try {
        const desiredDate = currentDate();

        const day = desiredDate.getDate();
        const month = desiredDate.getMonth() + 1; // Months are zero-based, so add 1
        const year = desiredDate.getFullYear();

        const userRole = req.user.role;

        let data;

        if (userRole === 'admin') {
            data = await Paket.find({}); // Fetch all data for admin users
        } else if (userRole === 'klijent') {
            const klijent = req.user.username;
            data = await Paket.find({ klijent: klijent }); // Fetch filtered data for klijent users
        } else {
            // Handle other roles or unauthorized users as needed
            res.status(403).send('Unauthorized');
            return;
        }

        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${day}-${month}-${year}`);

        // Define the columns in your Excel file
        if (userRole === 'admin') {
            worksheet.columns = [
                { header: 'Klijent', key: 'klijent' },
                { header: 'Grad', key: 'grad' },
                { header: 'Cena', key: 'cena' },
                { header: 'PTT', key: 'ptt' },
                { header: 'Adresa - ime i prezime', key: 'adresa' },
                { header: 'Telefon', key: 'telefon' },
                { header: 'Datum', key: 'datum' },
                { header: 'Napomena', key: 'napomena' },
            ];
        } else {
            worksheet.columns = [
                { header: 'Posiljalac', key: 'klijent' },
                { header: 'Grad', key: 'grad' },
                { header: 'Adresa - ime i prezime', key: 'adresa' },
                { header: 'Telefon', key: 'telefon' },
                { header: 'Ukupna Cena', key: 'ukupnacena' },
                { header: 'Napomena', key: 'napomena' },
            ];
        }

        // Add data from the database to the worksheet
        data.forEach((item) => {
            item = item.toObject();
            item.ukupnacena = item.cena + item.ptt;
            worksheet.addRow(item);
        });

        // Set response headers for Excel file download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Lista ${day}-${month}-${year}.xlsx`);

        // Stream the Excel file to the response
        const buffer = await workbook.xlsx.writeBuffer();
        res.end(buffer, () => {
            console.log('Excel file sent in response.');
        });
    } catch (error) {
        console.error('Error exporting data to Excel:', error);
        res.status(500).send('An error occurred while exporting data to Excel.');
    }
};