module.exports.timeRestrictedAccsess = (req, res, next) => {
    // Check the current time
    const currentTime = new Date().getHours();

    const userRole = req.user.role;

    // Allow access only between 11 and 12 o'clock for "klijent" role
    if (userRole === 'klijent' && currentTime >= 13 && currentTime < 14) {
        req.flash('info', 'Unos i brisanje pošiljaka za današnji dan je završen. Započnite unos pošiljaka za sutra nakon 12h. Hvala na razumevanju!');


        res.redirect('/paket');
    } else {
        next();
    }
};