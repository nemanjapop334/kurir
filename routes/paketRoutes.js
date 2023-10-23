const express = require('express');
const paketController = require('../controllers/paketController');
const isAuth = require('../middleware/authMiddleware').isAuth;
const isAdmin = require('../middleware/authMiddleware').isAdmin;

const router = express.Router();

router.get('/', isAuth, paketController.paket_index);
router.get('/admin', isAdmin, paketController.paket_admin);
router.post('/', paketController.paket_create_post);
router.delete('/:id', isAuth, paketController.paket_delete);


// router.put('/:id', paketController.paket_update);
// router.get('/:id', paketController.paket_details);
module.exports = router;