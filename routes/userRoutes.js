const router = require('express').Router();
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const User = require('../models/user');
const isAuth = require('../middleware/authMiddleware').isAuth;
const isAdmin = require('../middleware/authMiddleware').isAdmin;

// /**
//  * -------------- POST ROUTES ----------------
//  */

router.post('/login', passport.authenticate('local', { failureRedirect: '/user/login' }), (req, res) => {
    if (req.user.admin === true) {
        res.redirect('/paket/admin'); // Redirect admin to the '/admin' route
    } else {
        res.redirect('/paket'); // Redirect non-admin users to the '/user' route
    }
});

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

//---------------DELETE ROUTE--------------------

router.delete('/:id', isAdmin, (req, res) => {
    const id = req.params.id;
    User.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/user/register' });
        })
        .catch(err => {
            console.log(err);
        });
});


/**
* -------------- GET ROUTES ----------------
*/

router.get('/register', isAdmin, (req, res, next) => {
    User.find().sort({ createdAt: -1 })
        .then(result => {
            res.render('register', { users: result, title: 'Register' });
        })
        .catch(err => {
            console.log(err);
        });
});

router.get('/login', (req, res, next) => {
    // Check if the user is already authenticated
    if (req.isAuthenticated()) {
        if (req.user.admin === true) {
            res.redirect('/paket/admin'); // Redirect to '/paket/admin' if already logged in and admin role 
        } else {
            res.redirect('/paket'); // Redirect to '/paket' if already logged in
        }
    } else {
        res.render('login', { title: 'Login' });
    }
});

router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/user/login')
})



module.exports = router;