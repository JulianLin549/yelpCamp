const mongoose = require('mongoose');
//Schema Setup
const campgroundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please ass a store ID'], //error message
        unique: true,
    },
    image: String,
    description: String,
    address: String,
    price: String,
    location: {
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String
    },
    createdAt: { type: Date, default: Date.now() },
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
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    rating: {
        type: Number,
        default: 0
    }
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground