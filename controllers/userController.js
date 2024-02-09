const User = require('../models/user');
const genPassword = require('../lib/passwordUtils').genPassword;
const validPassword = require('../lib/passwordUtils').validPassword;


const user_login_post = (req, res) => {

    // Check for flash messages
    const error = req.flash('error')[0];
    // If the user is authenticated, redirect to the appropriate route
    if (req.isAuthenticated()) {
        if (req.user.role === 'admin') {
            res.redirect('/paket/admin'); // Redirect admin to the '/admin' route
        } else {
            res.redirect('/paket'); // Redirect non-admin users to the '/user' route
        }
    } else {
        // If not authenticated, render the login page with the error message
        res.render('login', { title: 'Login', error });
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
        pttBG: (role === 'klijent' ? req.body.pttBG : null), // Save the PTT value only for 'klijent'
        pttNS: (role === 'klijent' ? req.body.pttNS : null),
        pttPA: (role === 'klijent' ? req.body.pttPA : null)
    });

    newUser.save()
        .then((user) => {
            console.log(user);
            res.redirect('/user/register');
        })
        .catch((error) => {
            console.error(error);
            // Handle the error appropriately, e.g., render an error page
            res.status(500).send('Internal Server Error');
        });
};

const user_change_password_post = (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Initialize the error variable
    let error = null;

    // Retrieve the user from the database using the authenticated user's ID
    User.findById(req.user.id)
        .then((user) => {
            // Validate current password
            const isPasswordValid = validPassword(currentPassword, user.hash, user.salt);

            if (isPasswordValid) {
                // Validate new password and confirm password
                if (newPassword === confirmPassword) {
                    // Hash the new password before storing it in the database
                    const { hash, salt } = genPassword(newPassword);
                    // Update user's password in the database
                    user.hash = hash;
                    user.salt = salt;
                    return user.save();
                } else {
                    // Handle incorrect new password error
                    error = 'new-password';
                    throw new Error('Nove šifre se ne poklapaju.');
                }
            } else {
                // Handle incorrect current password error
                error = 'current-password';
                throw new Error('Netačan unos trenutne šifre.');
            }
        })
        .then(() => {
            // Password change was successful, redirect to login
            res.redirect('/user/login');
        })
        .catch((error) => {
            console.error('Error changing password:', error);
            res.render('changepassword', { title: 'Promeni šifru', error: error.message, userRole: req.user.role });
        });
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
            res.render('register', { users: result, title: 'Korisnici', userRole: req.user.role });
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
        const error = req.flash('error')[0] || null;
        res.render('login', { title: 'Login', error });
    }
};

const user_change_password_get = (req, res) => {
    // Ensure that the error variable is defined (even if it's null)
    const error = req.flash('error')[0] || null;
    res.render('changepassword', { title: 'Promeni šifru', error, userRole: req.user.role });
};

module.exports = {
    user_login_post,
    user_register_post,
    user_change_password_post,
    user_delete,
    user_register_get,
    user_login_get,
    user_change_password_get
}