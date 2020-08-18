const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require("passport-local"),
    mathodOverride = require("method-override"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    flash = require("connect-flash"),
    User = require("./models/user"),
    seedDB = require("./seeds")


const commentRoutes = require('./routes/comments'),
    campgroundRoutes = require('./routes/campgrounds'),
    indexRoutes = require('./routes/index')
app.use(express.static(__dirname + '/public')) //dirname是你現在script跑的位置。

app.use(mathodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "A25I5HF(4#)R(FFS)#&$8zdFel/-*+st#(&CMJNW",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
//passport.use(User.createStrategy());
passport.use(new LocalStrategy(User.authenticate()));

//they are resposible of reading the session, taking the data from the session,
//and encoded and undecoded the data and put it back into the session.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware who send req.user to every route
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

mongoose.connect("mongodb://localhost:27017/yelp_camp", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }).then(() => console.log(`Database connected`))
    .catch(err => console.log(`Database connection error: ${err.message}`));;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public")); //去public找東西
app.set('view engine', 'ejs'); //把ejs設訂為預設檔案。

//seed the db
//seedDB(); //init a starting data

app.use('/', indexRoutes)
app.use('/campgrounds/:id/comments', commentRoutes)
app.use('/campgrounds', campgroundRoutes)

app.get('/:else', (req, res) => {
    res.send("No such pass exist.")
})
const server = app.listen(3000, () => {
    console.log('Listening on port 3000');
});