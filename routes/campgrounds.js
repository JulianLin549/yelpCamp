const express = require('express'),
    router = express.Router(),
    Campground = require('../models/campground'),
    middleware = require('../middleware'), //will automaticlly include index.js
    multer = require('multer'),
    fs = require("fs"),
    request = require("request-promise-native");

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
        //
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
                'Authorization': 'Client-ID' + process.env.IMGUR_Client_ID
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
        res.redirect('/campgrounds/' + campground.id);

    } catch (error) {
        console.log(error);
        req.flash('error', err.message);
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
            console.log(imgurURLToJSON2)
            // add imgur url for the image to the campground object under image property
            req.body.campground.image = imgurURLToJSON2;
            fs.unlinkSync(req.file.path);

        }
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