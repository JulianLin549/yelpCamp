const express = require('express');
const router = express.Router()
const Campground = require('../models/campground');
const middleware = require('../middleware') //will automaticlly include index.js
const multer = require('multer');

//set filename to multer 
let storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
//only allow jpeg, jpeg, png, gif to be uploaded
let imageFilter = function(req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
let upload = multer({ storage: storage, fileFilter: imageFilter })


//configure cloudnary
let cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'dgasptnr5',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


router.get('/', (req, res) => {
    //fuzzy search
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        //get all campgrounds from DB
        Campground.find({ name: regex }, (err, allcampgrounds) => {
            if (err) {
                console.log(err);
            } else {
                if (allcampgrounds.length < 1) {
                    req.flash("error", "Campground no found");
                    return res.redirect("back");
                }
                res.render("campgrounds/index", {
                    campgrounds: allcampgrounds,
                    page: 'campgrounds'
                }); //傳入campgrounds property to ejs file
            }
        })
    } else {
        //get all campgrounds from DB
        Campground.find({}, (err, allcampgrounds) => {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", {
                    campgrounds: allcampgrounds,
                    page: 'campgrounds'
                }); //傳入campgrounds property to ejs file
            }
        })
    }
});
//Create == add new campground to DB
//you can upload the image
router.post('/', middleware.isLoggedIn, upload.single('image'), (req, res) => {
    //req.file comming from multer
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        }
        Campground.create(req.body.campground, (err, campground) => {
            if (err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
        });
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
        if (err || !foundCampground) {
            req.flash("error", "Campground not found!");
            return res.redirect("back");
            //console.log(err);
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
        if (err) {
            req.flash("error", "Campground doesn't exist.");
        } else {
            res.render("campgrounds/edit", { campground: foundCampground })
        }
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

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "||$&")
}

module.exports = router