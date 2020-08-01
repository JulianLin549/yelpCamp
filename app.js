const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Campground = require("./models/campground")
mongoose.connect("mongodb://localhost:27017/yelp_camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public")); //去public找東西
app.set('view engine', 'ejs'); //把ejs設訂為預設檔案。


/* Campground.create(
    {
        name: "Granite Hill",
        image: "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350",
        description: "This is Granite Hill, no bathroom, no water, beautiful."
    },
    function(err, campground){
        if(err){
            console.log(err)
        }else{
            console.log("newly create campground");
            console.log(campground);
        }
    })  */

const campgrounds = [{
        name: "Salmon Creek",
        image: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&h=350"
    },
    {
        name: "Granite Hill",
        image: "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350"
    },
    {
        name: "Mountain Goat Camp",
        image: "https://cdn2.howtostartanllc.com/images/business-ideas/business-idea-images/Campground.webp"
    },
    {
        name: "Salmon Creek",
        image: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&h=350"
    },
    {
        name: "Granite Hill",
        image: "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350"
    },
    {
        name: "Mountain Goat Camp",
        image: "https://cdn2.howtostartanllc.com/images/business-ideas/business-idea-images/Campground.webp"
    },

]

app.get('/', (req, res) => {
    res.render("landing");
});

app.get('/campgrounds', (req, res) => {
    //get all campgrounds from DB
    Campground.find({}, (err, allcampgrounds) => {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {
                campgrounds: allcampgrounds
            }); //傳入campgrounds property to ejs file
        }
    })
});

app.post('/campgrounds', (req, res) => {
    //get data from for ans ass to campground arrayy
    let name = req.body.name;
    let image = req.body.image;
    let description = req.body.description;
    let newCampground = {
        name: name,
        image: image,
        description: description
    };
    //Create a new Campground and save to DB
    Campground.create(newCampground, (err, newlyCreated) => {
        //should be if user type something wrong, sent user back to form and tell them
        //should use escape key
        if (err) {
            console.log(err);
        } else {
            res.redirect('/campgrounds');
        }
    });
});
//要比/:id前定義，不然會變成/:id 優先
app.get('/campgrounds/new', (req, res) => {
    res.render('new.ejs');
});
// SHOW- Shows more info about one campground
app.get('/campgrounds/:id', (req, res) => {
    //用ID找就不會重複。
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
            console.log(err);
        } else {
            res.render("show", {
                campground: foundCampground
            }); //把回傳的campground傳到ejs裡面。
        }
    });

})
const server = app.listen(3000, () => {
    console.log('Listening on port 3000');
});