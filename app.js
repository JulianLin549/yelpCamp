const express = require('express');  
const  app = express();  
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); //去public找東西
app.set('view engine', 'ejs'); //把ejs設訂為預設檔案。

const campgrounds = [
    {name: "Salmon Creek", image: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&h=350"},
    {name: "Granite Hill", image: "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350"},
    {name: "Mountain Goat Camp", image: "https://pixabay.com/get/52e8d4444255ae14f1dc84609620367d1c3ed9e04e507440762d7add904dc6_340.jpg"},
    {name: "Granite Hill", image: "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350"},
    {name: "Mountain Goat Camp", image: "https://pixabay.com/get/52e8d4444255ae14f1dc84609620367d1c3ed9e04e507440762d7add904dc6_340.jpg"},{name: "Granite Hill", image: "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350"},
    {name: "Mountain Goat Camp", image: "https://pixabay.com/get/52e8d4444255ae14f1dc84609620367d1c3ed9e04e507440762d7add904dc6_340.jpg"},{name: "Granite Hill", image: "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350"},
    {name: "Mountain Goat Camp", image: "https://pixabay.com/get/52e8d4444255ae14f1dc84609620367d1c3ed9e04e507440762d7add904dc6_340.jpg"},
    
]

app.get('/', (req, res) => {  
    res.render("landing");
});

app.get('/campgrounds', (req, res) => {  
    
    res.render("campgrounds",{campgrounds:campgrounds});//傳入campgrounds property to ejs file
});

app.post('/campgrounds', (req, res) => {
    //get data from for ans ass to campground arrayy
    let name = req.body.name;
    let image = req.body.image;
    let newCampground = { name:name, image:image};
    campgrounds.push(newCampground);
    res.redirect("/campgrounds")
});

app.get('/campgrounds/new', (req, res) => {  
    res.render('new.ejs')
});
var server = app.listen(3000, () => {  
    console.log('Listening on port 3000');  
});   