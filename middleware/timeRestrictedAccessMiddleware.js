module.exports.timeRestrictedAccsess = (req, res, next) => {
    // Check the current time
    const currentHour = new Date().getHours();
    const currentMinutes = new Date().getMinutes();

    const userRole = req.user.role;
    const timeRestrictStartHour = 11;
    const timeRestrictStartMinutes = 15;
    const timeRestrictEndHour = 17;
    const timeRestrictEndMinutes = 0;

    // Convert the current time to minutes for easier comparison
    const currentTimeInMinutes = currentHour * 60 + currentMinutes;

    const isWeekend = [0, 6].includes(new Date().getDay());

    // Convert the time restriction time to minutes
    const timeRestrictStartInMinutes = timeRestrictStartHour * 60 + timeRestrictStartMinutes;
    const timeRestrictEndInMinutes = timeRestrictEndHour * 60 + timeRestrictEndMinutes;
    // Allow access only between 10:30 and 14:00 o'clock for "klijent" role
    if (userRole === 'klijent' && !isWeekend && currentTimeInMinutes >= timeRestrictStartInMinutes && currentTimeInMinutes < timeRestrictEndInMinutes) {
        req.flash('info', 'Unos i brisanje pošiljaka za današnji dan je završen. Pošiljke za sutra moćićete da unosite nakon 14h. Hvala na razumevanju!');


        res.redirect('/paket');
    } else {
        next();
    }
};