const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/blog_demo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});


const postSchema = new mongoose.Schema({
    title: String,
    content: String,
});
const Post = mongoose.model("Post", postSchema);

/* 
embedded data means that you actually embedded data inside the database in user.
*/


//embedded postSchema inside userSchema
//PostSchema should be before userSchema in order for userSchema to get postSchema
const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    posts: [postSchema]
});
const User = mongoose.model("User", userSchema);


/* 
const newUser = new User({
    email: "julian@gmail.com",
    name: "julian lin"
});
//push new post to post array
newUser.posts.push({
    title: "Hoeto this is go",
    content: "thisi si julian content"
})

//
newUser.save(function (err, user) {
    if (err) {
        console.log(err)
    } else {
        console.log(user)
    }
}) */

/* 
const newPost = new Post({
    title: "New Post",
    content: "This is the new post!"
})

newPost.save(function (err, post) {
    if (err) {
        console.log(err)
    } else {
        console.log(post)
    }
}); */
User.findOne({
    name: "julian lin"
}, function (err, user) {
    if (err) {
        //console.log(err);
    } else {
        user.posts.push({
            title: "3 things ",
            content: "................nothing"
        });
        user.save(function (err, user) {
            if (err) {
                console.log(err)
            } else {
                console.log(user)
            }
        });
    }
});