const Paket = require('../models/paket');

const paket_index = (req, res) => {
    Paket.find().sort({ createdAt: -1 })
        .then(result => {
            res.render('unospaketa', { pakets: result, title: 'Lista unetih posiljaka' });
        })
        .catch(err => {
            console.log(err);
        });
}

const paket_details = (req, res) => {
    const id = req.params.id;
    Paket.findById(id)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });
}

const paket_create_post = (req, res) => {
    const paket = new Paket(req.body);
    paket.save()
        .then(result => {
            res.redirect('/paket');
        })
        .catch(err => {
            console.log(err);
        });
}

const paket_delete = (req, res) => {
    const id = req.params.id;
    Paket.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/paket' });
        })
        .catch(err => {
            console.log(err);
        });
}

const paket_update = (req, res) => {
    const id = req.params.id;
    Paket.findByIdAndUpdate(id, req.body, { new: true })
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log(err);
        });
}

module.exports = {
    paket_index,
    paket_create_post,
    paket_delete,
}