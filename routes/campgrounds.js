const express = require('express'),
    router = express.Router(),
    Campground = require('../models/campground'),
    Notifications = require('../models/notification'),
    middleware = require('../middleware'), //will automaticlly include index.js
    multer = require('multer'),
    fs = require("fs"),
    request = require("request-promise-native"),
    User = require("../models/user"),
    Review = require("../models/review");

//set filename to multer 
const storage = multer.diskStorage({
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
router.post('/', middleware.isLoggedIn, upload.single('image'), async (req, res) => {
    //req.file comming from multer, default store image in temp
    console.log(req.file.path);
    try {
        //add location to campground
        if (Math.abs(parseFloat(req.body.longitude)) > 180 || Math.abs(parseFloat(req.body.latitude)) > 90) {
            throw new Error('Location coordination out of range.')
        }
        req.body.campground.location = {
            type: 'Point',
            coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
        }

        //去node server暫存區找圖片在哪
        let bitmap = fs.readFileSync(req.file.path);
        // 將圖片轉成base64
        let encode_image = Buffer.from(bitmap).toString('base64');
        //======================
        //imgur request setting
        //======================
        request_options = {
            'method': 'POST',
            'url': 'https://api.imgur.com/3/image',
            'headers': {
                'Authorization': 'Client-ID ' + process.env.IMGUR_CLIENT_ID
            },
            formData: {
                'image': encode_image
            }
        };
        //發request
        await request(request_options, function(error, response) {
            if (error) throw new Error(error);
            imgurURL = response.body
        });
        //這邊回傳的imgurURL是JSON要轉成str才能存到mongodb
        const imgurURLToJSON2 = JSON.parse(imgurURL).data.link
        console.log(imgurURLToJSON2)
        // add imgur url for the image to the campground object under image property
        req.body.campground.image = imgurURLToJSON2;

        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        }

        //把暫存區的圖片砍掉
        fs.unlinkSync(req.file.path);
        //塞到db裡面
        let campground = await Campground.create(req.body.campground);
        //讓我的follower 知道你上傳了campgorund
        let user = await User.findById(req.user._id).populate('followers').exec();
        let newNotification = {
            username: req.user.username,
            campgroundId: campground.id
        }
        //讓我的所有followers接收通知(塞通知到他的notifications DB)
        for (const follower of user.followers) {
            let notification = await Notification.create(newNotification); //make a new notification
            follower.notification.push(notification);
            follower.save()
        }

        res.redirect('/campgrounds/' + campground.id);

    } catch (error) {
        console.log(error);
        req.flash('error', error.message);
        return res.redirect('back');
    }

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
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: { sort: { createdAt: -1 } }
    }).exec(function(err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found!");
            return res.redirect("back");
            //console.log(err);
        } else {
            res.render("campgrounds/show", {
                campground: foundCampground,
                mapboxAccessToken: process.env.MAPBOT_ACCESS_TOKEN
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
router.put('/:id', middleware.checkCampgroundOwnership, upload.single('image'), async (req, res) => {

    try {
        //如果有更新照片
        if (req.file) {
            //去node server暫存區找圖片在哪
            let bitmap = fs.readFileSync(req.file.path);
            // 將圖片轉成base64
            let encode_image = Buffer.from(bitmap).toString('base64');
            //======================
            //imgur request setting
            //======================

            //發request
            await request(request_options, function(error, response) {
                if (error) throw new Error(error);
                imgurURL = response.body
            });
            //這邊回傳的imgurURL是JSON要轉成str才能存到mongodb
            const imgurURLToJSON2 = JSON.parse(imgurURL).data.link
            //console.log(imgurURLToJSON2)
            // add imgur url for the image to the campground object under image property
            req.body.campground.image = imgurURLToJSON2;
            fs.unlinkSync(req.file.path);

        }
        delete req.body.campground.rating;
        let data = req.body.campground; //在ejs裡面包好了campground[name, image, author]
        //find and update
        await Campground.findByIdAndUpdate(req.params.id, data);
        res.redirect("/campgrounds/" + req.params.id);

    } catch (error) {
        console.log(error);
        req.flash('error', err.message);
        return res.redirect('back');
    }
})

// DESTROY CAMPGROUND
router.delete('/:id', middleware.checkCampgroundOwnership, async (req, res) => {
    try {
        let campground = await Campground.findById(req.params.id);
        await Comment.remove({ "_id": { $in: campground.comments } });
        await Review.remove({ "_id": { $in: campground.reviews } })
        campground.remove();
        req.flash("success", "Campground deleted successfully!");
        res.redirect("/campgrounds");

    } catch (error) {
        console.log(err);
        res.redirect("/campgrounds");
    }

})

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "||$&")
}

module.exports = router