const router = require('express').Router();
const passport = require('passport');
const isAuth = require('../middleware/authMiddleware').isAuth;
const isAdmin = require('../middleware/authMiddleware').isAdmin;
const userContorller = require('../controllers/userController');

//  * -------------- POST ROUTES ----------------
router.post('/login', passport.authenticate('local', {
    failureRedirect: '/user/login',
    failureFlash: 'Pogrešno korisničko ime ili šifra!'
}), userContorller.user_login_post);
router.post('/register', isAdmin, userContorller.user_register_post);
router.post('/change-password', isAuth, userContorller.user_change_password_post);

//---------------DELETE ROUTE--------------------
router.delete('/:id', isAdmin, userContorller.user_delete);


//-------------- GET ROUTES ----------------
router.get('/register', isAdmin, userContorller.user_register_get);
router.get('/login', userContorller.user_login_get);
router.get('/change-password', userContorller.user_change_password_get);
router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/user/login')
})

module.exports = router;