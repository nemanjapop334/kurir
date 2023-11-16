const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
var passport = require('passport');
var crypto = require('crypto');
const flash = require('express-flash');
var paketRoutes = require('./routes/paketRoutes');
var userRoutes = require('./routes/userRoutes');
const connection = require('./lib/dbconnection');

const MongoStore = require('connect-mongo')(session);
require('dotenv').config();
require('./scripts/initialize');
// express app
const app = express();

//connect to the DB and listen on port 3000
connection.then(result => app.listen(3000)).catch(err => console.log(err));

//register view engine
app.set('view engine', 'ejs');

//middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

/**
 * -------------- SESSION SETUP ----------------
 */

const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' });

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    }
}));

app.use(flash());

// Need to require the entire Passport config module so app.js knows about it
require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});

//routes
app.get('/', (req, res) => {
    res.redirect('/user/login');
});
app.use('/paket', paketRoutes);
app.use('/user', userRoutes);

app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});