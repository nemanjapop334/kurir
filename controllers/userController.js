const User = require('../models/user');
const Paket = require('../models/paket');
const genPassword = require('../lib/passwordUtils').genPassword;
const validPassword = require('../lib/passwordUtils').validPassword;
const { getPdfClientViewData } = require('../lib/pdfClient');


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

        res.render('changepassword', {
            title: 'Promeni šifru',
            error: error.message,
            userRole: req.user.role,
            userPhone: req.user.phone,
            ...getPdfClientViewData(req.user?.username),
        });
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
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).send("User not found");
        }
        res.json({ redirect: '/user/register' });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const renderRegisterPage = async (res, req, extra = {}) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('register', {
        users,
        title: 'Korisnici',
        userRole: req.user.role,
        error: null,
        editError: null,
        editingUser: null,
        ...extra
    });
};

const user_update_post = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send("User not found");
        }

        const username = (req.body.username || '').trim();
        const role = req.body.role;
        const password = req.body.password;
        const confirmPassword = req.body['confirm-password'];
        const editingUser = {
            id,
            username,
            role,
            pttBG: req.body.pttBG || '',
            pttNS: req.body.pttNS || '',
            pttPA: req.body.pttPA || ''
        };

        if (!username) {
            return renderRegisterPage(res, req, { editError: 'Korisničko ime je obavezno.', editingUser });
        }

        if (role !== 'admin' && role !== 'klijent') {
            return renderRegisterPage(res, req, { editError: 'Nevažeća uloga korisnika.', editingUser });
        }

        const existingUser = await User.findOne({ username, _id: { $ne: id } });
        if (existingUser) {
            return renderRegisterPage(res, req, { editError: 'Korisničko ime već postoji.', editingUser });
        }

        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                return renderRegisterPage(res, req, { editError: 'Šifre se ne poklapaju.', editingUser });
            }

            const { hash, salt } = genPassword(password);
            user.hash = hash;
            user.salt = salt;
        }

        const oldUsername = user.username;

        user.username = username;
        user.role = role;
        user.pttBG = role === 'klijent' ? req.body.pttBG : null;
        user.pttNS = role === 'klijent' ? req.body.pttNS : null;
        user.pttPA = role === 'klijent' ? req.body.pttPA : null;

        await user.save();

        if (oldUsername !== username) {
            await Paket.updateMany({ klijent: oldUsername }, { klijent: username });
        }

        res.redirect('/user/register');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const user_register_get = async (req, res) => {
    try {
        await renderRegisterPage(res, req);
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

    res.render('changepassword', {
        title: 'Moj profil',
        error,
        userRole: req.user.role,
        userPhone: req.user.phone,
        ...getPdfClientViewData(req.user.username),
    });
};

module.exports = {
    user_login_post,
    user_register_post,
    user_change_password_post,
    user_delete,
    user_update_post,
    user_register_get,
    user_login_get,
    user_change_password_get,
    user_phone
}