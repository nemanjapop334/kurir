const User = require('../models/user');
const genPassword = require('../lib/passwordUtils').genPassword;
require('dotenv').config();


User.findOne({ role: 'admin' }, (err, admin) => {
    console.log('Checking for admin user...');
    if (err) {
        console.error('Error checking for admin user:', err);
    }
    if (!admin) {
        console.log('Admin user not found. Creating...');
        const saltHash = genPassword(process.env.ADMIN_PASSWORD);
        const salt = saltHash.salt;
        const hash = saltHash.hash;

        // Create the default admin user
        const adminUser = new User({
            username: process.env.ADMIN_USERNAME,
            hash: hash,
            salt: salt,
            role: 'admin',
            ptt: null,
        });
        adminUser.save((err) => {
            if (err) {
                console.error('Error creating admin user:', err);
            } else {
                console.log('Default admin user created.');
            }
        });
    } else {
        console.log('Admin user found.');
    }
});