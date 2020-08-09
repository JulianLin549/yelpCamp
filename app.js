const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    User = require("./models/user"),
    seedDB = require("./seeds")

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "A25I5HF(4#)R(FFS)#&$8zdFel/-*+st#(&CMJNW",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
//passport.use(User.createStrategy());
passport.use(new LocalStrategy(User.authenticate()));

//they are resposible of reading the session, taking the data from the session,
//and encoded and undecoded the data and put it back into the session.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware who send req.user to every route
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})

mongoose.connect("mongodb://localhost:27017/yelp_camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public")); //去public找東西
app.set('view engine', 'ejs'); //把ejs設訂為預設檔案。
app.use(express.static(__dirname + '/public')) //dirname是你現在script跑的位置。
seedDB(); //init a starting data


app.get('/', (req, res) => {
    res.render("landing");
});

app.get('/campgrounds', (req, res) => {
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
    res.render('campgrounds/new');
});
// SHOW- Shows more info about one campground
app.get('/campgrounds/:id', (req, res) => {
    //用ID找就不會重複。
    //retreving one campground with the right id
    //we populate the comments array on it (we get the real comments from the comments DB, so it is not just ids) 
    //and we exec the function
    Campground.findById(req.params.id).populate("comments").exec(function (err, foundCampground) {
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

//======================================
//COMMENTS ROUTES
//======================================
app.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
    //find campground by id
    Campground.findById(req.params.id, (err, campground) => {
        if (err) {
            console.log(err)
        } else {
            //send to render
            res.render('comments/new', {
                campground: campground
            });
        }
    })

});

app.post('/campgrounds/:id/comments', isLoggedIn, (req, res) => {
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
                    //associate comment with campground
                    campground.comments.push(comment);
                    campground.save()
                    res.redirect('/campgrounds/' + campground._id);
                }

            })
        }
        //create new Comment
        //connect new comment to campground
        //redirect campground show page
    });
});
//=========================================
//AUTH ROUTES
//=========================================

//show signup form
app.get("/register", (req, res) => {
    res.render("register");
});

//handling user signup
app.post("/register", (req, res) => {
    let newUser = new User({
        username: req.body.username
    });
    //User.register is provided by local mongoose
    //make a new user object only pass in user name
    //because we dont want to store real password into database
    //we take the password as second argument and User.register will hash it
    //and we save it in the database
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            return res.render('register');
        }
        //log the user in, take care of the session, run the serialize session method
        //use local strategy, we can use facebook, google etc.
        passport.authenticate("local")(req, res, () => {
            res.redirect("/campgrounds");
        });
    });
});

//LOGIN ROUTES
//render login form
app.get("/login", (req, res) => {
    res.render("login");
});
//login logic
//using middle ware
app.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), (req, res) => {});


//LOGOUT
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

const server = app.listen(3000, () => {
    console.log('Listening on port 3000');
});