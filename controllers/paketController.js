const Paket = require('../models/paket');

const paket_index = async (req, res) => {
    try {
        const info = req.flash('info')[0] || null;
        const klijent = req.user.username;

        const paket = await Paket.find({ klijent: klijent }).sort({ createdAt: -1 });
        res.render('unospaketa', { pakets: paket, title: `${klijent} UNOS PAKETA`, userRole: req.user.role, info, klijent });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    };
};
const paket_admin = async (req, res) => {
    try {
        const paket = await Paket.find();
        res.render('adminlista', { pakets: paket, title: 'Lista pošiljaka', userRole: req.user.role });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};


const paket_create_post = async (req, res) => {
    try {
        const ptt = req.user[`ptt${req.body.grad}`];
        const combinedData = {
            klijent: req.user.username,
            grad: req.body.grad,
            adresa: req.body.adresa,
            telefon: req.body.telefon,
            cena: req.body.cena,
            ptt: ptt,
            napomena: req.body.napomena,
        };
        const paket = await Paket.create(combinedData);
        res.redirect(303, '/paket');
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const paket_delete = async (req, res) => {
    try {
        const id = req.params.id;
        const paket = await Paket.findByIdAndDelete(id);
        res.json({ redirect: '/paket/admin' });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};

const paket_delete_all = async (req, res) => {
    try {
        const paket = await Paket.deleteMany({});
        console.log(`Deleted ${result.deletedCount} documents from the "pakets" collection.`);
        res.redirect('/paket/admin');
    } catch (err) {
        console.error('Error deleting data from the "pakets" collection:', error);
        res.status(500).send('An error occurred while deleting data from the "pakets" collection.');
    }
}
module.exports = {
    paket_index,
    paket_create_post,
    paket_delete,
    paket_admin,
    paket_delete_all,
};