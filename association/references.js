const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/blog_demo_2", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const Post = require("./models/post");
const User = require("./models/user");
/* 
embedded data means you embedded data inside user shcema
{
  name: "user".
  post:[
    {title:"THIS IS TITLE",  content:"THIS IS CONTENT"},
    {title:"THIS IS TITLE",  content:"THIS IS CONTENT"},
    {title:"THIS IS TITLE",  content:"THIS IS CONTENT"},
    {title:"THIS IS TITLE",  content:"THIS IS CONTENT"},
    {title:"THIS IS TITLE",  content:"THIS IS CONTENT"}
  ]
}
*/
/* object references means you just reference the post by id 
    inside another db, only store id inside user schema
{
  name: "user".
  post:[
    5f2579ed9627d77d18846fbd,
    5f2578c5ff3abc846c6eea16,
    5f2578c5ff3abc846c6eea15,
    5f2575a1e429f621709e0721
  ]
}
*/
/* 
const postSchema = new mongoose.Schema({
    title: String,
    content: String,
});
const Post = mongoose.model("Post", postSchema); */

//embedded postSchema inside userSchema
//PostSchema should be before userSchema in order for userSchema to get postSchema
/* const userSchema = new mongoose.Schema({
    email: String,
    name: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId, //array of object ids
        ref: "Post"
    }]
});
const User = mongoose.model("User", userSchema); */
/* 
User.create({
  email: "bob@gmail.com",
  name: "bob belger"
}); */
Post.create({
        title: "How to cook best burger Part3",
        content: "ppppppppppppppppppppppppp"
    },
    function (err, post) {
        User.findOne({
                email: "bob@gmail.com"
            },
            function (err, foundUser) {
                if (err) {
                    console.log(err);
                } else {
                    foundUser.posts.push(post);
                    foundUser.save(function (err, data) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(data)
                        }
                    });
                }
            }
        )
    }
)

//Find user
//find all posts for that user
User.findOne({
    email: "bob@gmail.com"
}).populate("posts").exec(function (err, user) {
    if (err) {
        console.log(err)
    } else {
        console.log(user)
    }
})