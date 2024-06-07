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

const user_register_post = async (req, res) => {
    try {
        const saltHash = genPassword(req.body.password);

        const salt = saltHash.salt;
        const hash = saltHash.hash;
        const role = req.body.role; // Get the selected role from the form

        const user = await User.create({
            username: req.body.username,
            hash: hash,
            salt: salt,
            role: role, // Save the selected role to the 'role' field in your User model
            pttBG: (role === 'klijent' ? req.body.pttBG : null), // Save the PTT value only for 'klijent'
            pttNS: (role === 'klijent' ? req.body.pttNS : null),
            pttPA: (role === 'klijent' ? req.body.pttPA : null)
        });
        console.log(user);
        res.redirect('/user/register');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const user_change_password_post = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Initialize the error variable
        let error = null;

        // Fetch user from the database
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new Error('Korisnik nije pronađen.');
        }

        // Validate current password
        const isPasswordValid = validPassword(currentPassword, user.hash, user.salt);
        if (!isPasswordValid) {
            error = 'current-password';
            throw new Error('Netačan unos trenutne šifre.');
        }

        // Validate new password and confirm password
        if (newPassword !== confirmPassword) {
            error = 'new-password';
            throw new Error('Nove šifre se ne poklapaju.');
        }

        // Hash the new password before storing it in the database
        const { hash, salt } = genPassword(newPassword);

        // Update user's password in the database
        user.hash = hash;
        user.salt = salt;
        await user.save();

        // Redirect to login page after successful password change
        res.redirect('/user/login');
    } catch (error) {
        console.error('Error changing password:', error);
        res.render('changepassword', { title: 'Promeni šifru', error: error.message, userRole: req.user.role, userPhone: req.user.phone });
    }
};

const user_phone = async (req, res) => {
    const { phone } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User is not found!');
        }
        user.phone = phone;
        await user.save();
        res.redirect('/user/change-password');
    } catch (error) {
        res.status(500).send('Internal server error.');
    }
};

const user_delete = async (req, res) => {
    try {
        const id = req.params.id;
        const user = User.findByIdAndDelete(id);
        res.json({ redirect: '/user/register' });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const user_register_get = async (req, res) => {
    try {
        const user = await User.find().sort({ createdAt: -1 })
        res.render('register', { users: user, title: 'Korisnici', userRole: req.user.role });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
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
    res.render('changepassword', { title: 'Moj profil', error, userRole: req.user.role, userPhone: req.user.phone });
};

module.exports = {
    user_login_post,
    user_register_post,
    user_change_password_post,
    user_delete,
    user_register_get,
    user_login_get,
    user_change_password_get,
    user_phone
}