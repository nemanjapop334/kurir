module.exports.timeRestrictedAccsess = (req, res, next) => {
    // Check the current time
    const currentTime = new Date().getHours();

    const userRole = req.user.role;

    // Allow access only between 11 and 12 o'clock for "klijent" role
    if (userRole === 'klijent' && currentTime >= 11 && currentTime < 12) {
        res.redirect('/paket');
    } else {
        next();
    }
};