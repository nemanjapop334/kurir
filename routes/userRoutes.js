const router = require('express').Router();
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const User = require('../models/user');
const isAuth = require('../middleware/authMiddleware').isAuth;
const isAdmin = require('../middleware/authMiddleware').isAdmin;

// /**
//  * -------------- POST ROUTES ----------------
//  */

router.post('/login', passport.authenticate('local', { failureRedirect: '/user/login', successRedirect: '/paket' }));

router.post('/register', isAdmin, (req, res, next) => {
    const saltHash = genPassword(req.body.password);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt,
        admin: false
    });

    newUser.save()
        .then((user) => {
            console.log(user);
        });

    res.redirect('/user/login');
});


/**
* -------------- GET ROUTES ----------------
*/

router.get('/register', isAdmin, (req, res, next) => {
    res.render('register', { title: 'Register' });
});

router.get('/login', (req, res, next) => {
    // Check if the user is already authenticated
    if (req.isAuthenticated()) {
        res.redirect('/paket'); // Redirect to '/paket' if already logged in
    } else {
        res.render('login', { title: 'Login' });
    }
});

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/user/login')
})


module.exports = router;