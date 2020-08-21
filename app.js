if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require("passport-local"),
    mathodOverride = require("method-override"),
    //Campground = require("./models/campground"),
    //Comment = require("./models/comment"),
    flash = require("connect-flash"),
    //User = require("./models/user"),
    settings = require("./settings");
//seedDB = require("./seeds")

app.use(express.static(__dirname + '/public')) //dirname是你現在script跑的位置。

app.use(mathodOverride("_method"));
app.use(flash());

//path
app.use('/public/images/', express.static('./public/images'));

//Passport config
require('./config/passport')(passport);

//connect DB
require("./db/connectDB");

//config email
//require("./config/smtp");


//PASSPORT CONFIGURATION
app.use(require("express-session")({
    cookieName: "session",
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    duration: settings.SESSION_DURATION,
    activeDuration: settings.SESSION_EXTENSION_DURATION,
    cookie: {
        httpOnly: true,
        ephemeral: settings.SESSION_EPHEMERAL_COOKIES,
        secure: settings.SESSION_SECURE_COOKIES,
    },
}));

//Passport Middleware init local strategy
app.use(passport.initialize());
app.use(passport.session());

/* // CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
//passport.use(User.createStrategy());
passport.use(new LocalStrategy(User.authenticate()));

//they are resposible of reading the session, taking the data from the session,
//and encoded and undecoded the data and put it back into the session.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); */



app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); //去public找東西
app.set('view engine', 'ejs'); //把ejs設訂為預設檔案。



//Global variable
//used to flash message
//can call the currentUser success_msg and error_msg from anywhere
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); //msg from passport.js will put error in req.flash('error)
    next();
})

app.locals.moment = require('moment');

//Routes
//pertain the route from the index
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))
app.use('/campgrounds/:id/comments', require('./routes/comments'))
app.use('/campgrounds', require('./routes/campgrounds'))

app.get('/:else', (req, res) => {
    res.send("No such pass exist.")
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`))