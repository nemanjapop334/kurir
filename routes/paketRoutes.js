const express = require('express');
const paketController = require('../controllers/paketController');
const isAuth = require('../middleware/authMiddleware').isAuth;
const isAdmin = require('../middleware/authMiddleware').isAdmin;
const exportToExcel = require('../lib/exportToExcell');
const router = express.Router();

router.get('/', isAuth, paketController.paket_index);
router.get('/admin', isAdmin, paketController.paket_admin);
router.get('/export-to-excel', isAdmin, exportToExcel);
router.get('/deleteall', isAdmin, paketController.paket_delete_all);

router.post('/', paketController.paket_create_post);
router.delete('/:id', isAuth, paketController.paket_delete);


module.exports = router;