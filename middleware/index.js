//all the middle goes here
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const User = require('../models/user');


const middlewareObj = {}

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {

        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                //if logged in, is he owned the campground
                //foundCampground.autho.id is a mongoose object
                //req.user._id is a string
                //even if they looks the same, they are essentially different,
                // so we have to use mongoose method .equals()
                if (foundComment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back")
                }

            }
        });
    } else {
        res.redirect("back"); //send to where the user originally from.
    }
}


middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    if (req.isAuthenticated()) {

        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                //if logged in, is he owned the campground
                //foundCampground.autho.id is a mongoose object
                //req.user._id is a string
                //even if they looks the same, they are essentially different,
                // so we have to use mongoose method .equals()
                if (foundCampground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that.");
                    res.redirect("back")
                }

            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("back"); //send to where the user originally from.
    }

};


middlewareObj.checkUserOwnership = async (req, res, next) => {
    if (req.isAuthenticated()) {
        try {
            let foundUser = await User.findById(req.params.id)
            if (foundUser._id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You are not the correct user, please log in !");
                res.redirect("/users/login")
            }

        } catch (error) {
            console.log(error)
            req.flash('error_msg', 'You are not the correct user, please log in!')
            res.redirect("/users/login");
        }

    } else {
        req.flash("error", "You need to be logged in to do that.");
        res.redirect("/users/login"); //send to where the user originally from.
    }

};



middlewareObj.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that.");
    res.redirect("/users/login");
}
module.exports = middlewareObj;