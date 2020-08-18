const express = require('express');
//mergeParams: true是為了讓'/campgrounds/:id/comments'裡面的:id可以被傳進來comment route，
//而不是只待在campground route。
const router = express.Router({ mergeParams: true })
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware') //will automaticlly include index.js

//comment create
router.get('/new', middleware.isLoggedIn, (req, res) => {
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
router.post('/', middleware.isLoggedIn, (req, res) => {
    //lookup campground using ID
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err);
            req.flash("error", "Campground not found.")
            res.redirect("/campgrounds")
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash("error", "Something went wrong.");
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
                    req.flash("success", "Successfully added comment");
                    res.redirect('/campgrounds/' + campground._id);
                }

            })
        }
        //create new Comment
        //connect new comment to campground
        //redirect campground show page
    });
});
//COMMENT EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    //to prevent sb from maliciously typing wrong campground id and break our application, we need to
    //first check the id is valid, then check the comment_id is valid.
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            req.flash("error", "No Campground find");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect("back")
            } else {
                res.render("comments/edit", {
                    campground_id: req.params.id,
                    comment: foundComment
                }) //之前在"/campgrounds/:id/comments" route就有:id(campground的)
            }
        });
    });
});
//COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    let data = req.body.comment;
    Comment.findByIdAndUpdate(req.params.comment_id, data, (err, updatedComment) => {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });

})
//COMMENT DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted.");
            res.redirect("/campgrounds/" + req.params.id);
        }
    })

})


module.exports = router