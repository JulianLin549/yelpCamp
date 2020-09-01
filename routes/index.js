const express = require('express');
const router = express.Router();
const passport = require('passport');
const middleware = require('../middleware'); //will automaticlly include index.js
const Notification = require("../models/notification");;
//const User = require('../models/user')


router.get('/', (req, res) => {
    res.render("landing");
});

//follow user
router.get("/follow/:id", middleware.isLoggedIn, async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        user.followers.push(req.user._id);
        user.save();
        req.flash("success", "Successfully followed " + user.username + "!");
        res.redirect(`/users/${req.params.id}`);

    } catch (error) {
        req.flash("error", error.message);
        res.redirect('back')
    }
});
//view all notifications
router.get("/notifications", middleware.isLoggedIn, async (req, res) => {
    try {
        let user = await User.findById(req.user._id).populate({
            path: 'notifications',
            options: { sort: { "_id": -1 } }
        }).exec();
        let allNotifications = user.notifications;
        res.render('notifications/index', { allNotifications })

    } catch (error) {
        req.flash("error", error.message);
        res.redirect('back')
    }
});

//handle notification
router.get("/notifications/:id", middleware.isLoggedIn, async (req, res) => {
    try {
        let notification = await Notification.findById(req.params.id);
        notification.isRead = true;
        notifications.save();
        res.redirect(`/campgrounds/${notification.campgroundId}`) //redirect to the added campground!

    } catch (error) {
        req.flash("error", error.message);
        res.redirect('back')
    }
});


module.exports = router