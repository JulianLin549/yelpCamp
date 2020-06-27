const express = require('express');  
const  app = express();  
const bodyParser = require('body-parser');

app.use(express.static("public")); //去public找東西
app.set('view engine', 'ejs'); //把ejs設訂為預設檔案。


app.get('/', (req, res) => {  
    res.render("landing");
});

app.get('/campgrounds', (req, res) => {  
    const campgrounds = [
        {name: "Salmon Creek", image: "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&h=350"},
        {name: "Granite Hill", image: "https://images.pexels.com/photos/2398220/pexels-photo-2398220.jpeg?auto=compress&cs=tinysrgb&h=350"},
        {name: "Mountain Goat Camp", image: "https://pixabay.com/get/52e8d4444255ae14f1dc84609620367d1c3ed9e04e507440762d7add904dc6_340.jpg"},
    ]
    res.render("campgrounds",{campgrounds:campgrounds});//傳入campgrounds property to ejs file
});

var server = app.listen(3000, () => {  
    console.log('Listening on port 3000');  
});   