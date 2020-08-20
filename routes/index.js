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
    res.render("register", { page: "register" });
});

//handling user signup
router.post("/register", async (req, res) => {
    let newUser = new User({
        username: req.body.username
    });
    //User.register is provided by local mongoose
    //make a new user object only pass in user name
    //because we dont want to store real password into database
    //we take the password as second argument and User.register will hash it
    //and we save it in the database
    User.register(newUser, req.body.password1, (err, user) => {
        if (err) {
            req.flash("error", err.message);
            res.redirect('/register');
        }
        //log the user in, take care of the session, run the serialize session method
        //use local strategy, we can use facebook, google etc.
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//LOGIN ROUTES
//render login form
router.get("/login", (req, res) => {
    res.render("login", { page: "login" });
});
//login logic
//using middle ware
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
    failureFlash: { type: 'error', message: 'Invalid username or password.' }
}));


//LOGOUT
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged out");
    res.redirect("/login");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

module.exports = router