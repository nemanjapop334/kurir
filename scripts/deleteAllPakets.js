const cron = require('node-cron');
const Paket = require('../models/paket');

const deleteAllPakets = async () => {
    try {
        const result = await Paket.deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from the "pakets" collection.`);
    } catch (err) {
        console.error('Error deleting data from the "pakets" collection:', err);
    }
};

cron.schedule('0 13 * * 1-5', () => {
    console.log('Running a task to delete all pakets at 13:00 from Monday to Friday');
    deleteAllPakets();
});
