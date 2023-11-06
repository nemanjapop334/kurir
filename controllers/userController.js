const User = require('../models/user');
const genPassword = require('../lib/passwordUtils').genPassword;

const user_login_post = (req, res) => {
    if (req.user.role === 'admin') {
        res.redirect('/paket/admin'); // Redirect admin to the '/admin' route
    } else {
        res.redirect('/paket'); // Redirect non-admin users to the '/user' route
    }
};

const user_register_post = (req, res) => {
    const saltHash = genPassword(req.body.password);

    const salt = saltHash.salt;
    const hash = saltHash.hash;
    const role = req.body.role; // Get the selected role from the form

    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt,
        role: role, // Save the selected role to the 'role' field in your User model
        ptt: (role === 'klijent' ? req.body.ptt : null) // Save the PTT value only for 'klijent'
    });

    newUser.save()
        .then((user) => {
            console.log(user);
        });

    res.redirect('/user/register');
};

const user_delete = (req, res) => {
    const id = req.params.id;
    User.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/user/register' });
        })
        .catch(err => {
            console.log(err);
        });
};

const user_register_get = (req, res) => {
    User.find().sort({ createdAt: -1 })
        .then(result => {
            res.render('register', { users: result, title: 'Klijenti' });
        })
        .catch(err => {
            console.log(err);
        });
};

const user_login_get = (req, res) => {
    // Check if the user is already authenticated
    if (req.isAuthenticated()) {
        if (req.user.role === 'admin') {
            res.redirect('/paket/admin'); // Redirect to '/paket/admin' if already logged in and admin role 
        } else {
            res.redirect('/paket'); // Redirect to '/paket' if already logged in
        }
    } else {
        res.render('login', { title: 'Login' });
    }
};

module.exports = {
    user_login_post,
    user_register_post,
    user_delete,
    user_register_get,
    user_login_get
}