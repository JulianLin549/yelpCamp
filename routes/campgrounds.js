const express = require('express');
const router = express.Router()
const Campground = require('../models/campground');
const middleware = require('../middleware') //will automaticlly include index.js

router.get('/', (req, res) => {
    //get all campgrounds from DB
    Campground.find({}, (err, allcampgrounds) => {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {
                campgrounds: allcampgrounds
            }); //傳入campgrounds property to ejs file
        }
    })
});
//Create == add new campground to DB
router.post('/', middleware.isLoggedIn, (req, res) => {
    //get data from for ans ass to campground arrayy
    let name = req.body.name;
    let image = req.body.image;
    let description = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    } // 只要isLoggedIn，就會有req.user
    let newCampground = { name, image, description, author };

    //Create a new Campground and save to DB
    Campground.create(newCampground, (err, newlyCreated) => {
        //should be if user type something wrong, sent user back to form and tell them
        //should use escape key
        if (err) {
            console.log(err);
        } else {
            console.log(newlyCreated)
            res.redirect('/campgrounds');
        }
    });
});
//要比/:id前定義，不然會變成/:id 優先
router.get('/new', middleware.isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});
// SHOW- Shows more info about one campground
router.get('/:id', (req, res) => {
    //用ID找就不會重複。
    //retreving one campground with the right id
    //we populate the comments array on it (we get the real comments from the comments DB, so it is not just ids) 
    //and we exec the function
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            //console.log(foundCampground);
            res.render("campgrounds/show", {
                campground: foundCampground
            }); //把回傳的campground傳到ejs裡面。
        }
    });
});

//EDIT CAMPGROUND
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
    //if user logged in?
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", { campground: foundCampground })
    })

})
// UPDATE CAMPGROUND
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    let data = req.body.campground; //在ejs裡面包好了campground[name]
    //find and update
    Campground.findByIdAndUpdate(req.params.id, data, (err, updatedCampground) => {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
})

// DESTROY CAMPGROUND
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            res.redirect("/campgrounds")
        } else {
            res.redirect("/campgrounds")
        }
    })
})

module.exports = router