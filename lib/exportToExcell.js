const ExcelJS = require('exceljs');
const Paket = require('../models/paket');

const currentDate = new Date();

const day = currentDate.getDate();
const month = currentDate.getMonth() + 1; // Months are zero-based, so add 1
const year = currentDate.getFullYear();

module.exports = async (req, res) => {
    try {
        const data = await Paket.find({}); // Fetch data from the database

        // Create a new Excel workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${day}-${month}-${year}`);

        // Define the columns in your Excel file
        worksheet.columns = [
            { header: 'Klijent', key: 'klijent' },
            { header: 'Adresa', key: 'adresa' },
            { header: 'Telefon', key: 'telefon' },
            { header: 'Cena', key: 'cena' },
            { header: 'PTT', key: 'ptt' },
        ];

        // Add data from the database to the worksheet
        data.forEach((item) => {
            worksheet.addRow(item.toObject()); // Assuming 'item' is a Mongoose document
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