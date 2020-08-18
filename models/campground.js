const mongoose = require('mongoose');
//Schema Setup
const campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    //comments object ids
    //ref: model refer to 
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]
});
const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground