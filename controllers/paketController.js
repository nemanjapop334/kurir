const Paket = require('../models/paket');

const paket_index = (req, res) => {
    const info = req.flash('info')[0] || null;
    const klijent = req.user.username;
    Paket.find({ klijent: klijent }).sort({ createdAt: -1 })
        .then(result => {
            res.render('unospaketa', { pakets: result, title: `${klijent} UNOS PAKETA`, userRole: req.user.role, info, klijent });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
};

const paket_admin = (req, res) => {
    Paket.find()
        .then(result => {
            res.render('adminlista', { pakets: result, title: 'Lista pošiljaka', userRole: req.user.role });
        })
        .catch(err => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
};


const paket_create_post = (req, res) => {

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
    const paket = new Paket(combinedData);
    paket.save()
        .then(result => {
            res.redirect(303, '/paket');
        })
        .catch(err => {
            console.log(err);
        });
};

const paket_delete = (req, res) => {
    const id = req.params.id;
    Paket.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/paket/admin' });
        })
        .catch(err => {
            console.log(err);
        });
};

const paket_delete_all = async (req, res) => {
    try {
        const result = await Paket.deleteMany({});
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