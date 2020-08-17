//======================================
//COMMENTS ROUTES
//======================================
const express = require('express');
//mergeParams: true是為了讓'/campgrounds/:id/comments'裡面的:id可以被傳進來comment route，
//而不是只待在campground route。
const router = express.Router({ mergeParams: true })

const Campground = require('../models/campground');
const Comment = require('../models/comment');

//comment create
router.get('/new', isLoggedIn, (req, res) => {
    //find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err)
        } else {
            //send to render

            console.log(campground)
            res.render('comments/new', { campground: campground });
        }
    })

});
//comment create
router.post('/', isLoggedIn, (req, res) => {
    //lookup campground using ID
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds")
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    console.log(err);
                } else {
                    //add username and id to comment
                    //console.log("created by " + req.user.username) // if the user is logged in, req.user must be valid
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save()

                    //associate comment with campground
                    campground.comments.push(comment);
                    //save comment in the campground
                    campground.save()
                    console.log(comment)
                    res.redirect('/campgrounds/' + campground._id);
                }

            })
        }
        //create new Comment
        //connect new comment to campground
        //redirect campground show page
    });
});
//middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
module.exports = router