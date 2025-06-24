const express = require('express');
const paketController = require('../controllers/paketController');
const isAuth = require('../middleware/authMiddleware').isAuth;
const isAdmin = require('../middleware/authMiddleware').isAdmin;
const timeRestrictedAccsess = require('../middleware/timeRestrictedAccessMiddleware').timeRestrictedAccsess;
const exportToExcel = require('../lib/exportToExcell');
const downloadPdf = require('../lib/pdfPrinter');
const downloadpdf2 = require('../lib/pdfPrinter2');
const router = express.Router();

router.get('/', isAuth, paketController.paket_index);
router.get('/admin', isAdmin, paketController.paket_admin);
router.get('/export-to-excel', isAuth, exportToExcel);
router.get('/downloadpdf', isAuth, downloadPdf);
router.get('/downloadpdf2', isAuth, downloadpdf2);
router.get('/deleteall', isAdmin, paketController.paket_delete_all);

router.post('/', isAuth, timeRestrictedAccsess, paketController.paket_create_post);
router.delete('/:id', isAuth, timeRestrictedAccsess, paketController.paket_delete);


module.exports = router;