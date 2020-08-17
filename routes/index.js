const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user')


router.get('/', (req, res) => {
    res.render("landing");
});

//=========================================
//AUTH ROUTES
//=========================================

//show signup form
router.get("/register", (req, res) => {
    res.render("register");
});

//handling user signup
router.post("/register", (req, res) => {
    let newUser = new User({
        username: req.body.username
    });
    //User.register is provided by local mongoose
    //make a new user object only pass in user name
    //because we dont want to store real password into database
    //we take the password as second argument and User.register will hash it
    //and we save it in the database
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render('register');
        }
        //log the user in, take care of the session, run the serialize session method
        //use local strategy, we can use facebook, google etc.
        passport.authenticate("local")(req, res, () => {
            res.redirect("/campgrounds");
        });
    });
});

//LOGIN ROUTES
//render login form
router.get("/login", (req, res) => {
    res.render("login");
});
//login logic
//using middle ware
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), (req, res) => {});


//LOGOUT
router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router