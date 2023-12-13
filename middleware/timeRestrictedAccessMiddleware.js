module.exports.timeRestrictedAccsess = (req, res, next) => {
    // Check the current time
    const currentTime = new Date().getHours();

    const userRole = req.user.role;
    const timeRestrictStart = 10;
    const timeRestrictEnd = 14;

    // Allow access only between 11 and 12 o'clock for "klijent" role
    if (userRole === 'klijent' && currentTime >= timeRestrictStart && currentTime < timeRestrictEnd) {
        req.flash('info', 'Unos i brisanje pošiljaka za današnji dan je završen. Pošiljke za sutra moćićete da unosite nakon 14h. Hvala na razumevanju!');


        res.redirect('/paket');
    } else {
        next();
    }
};