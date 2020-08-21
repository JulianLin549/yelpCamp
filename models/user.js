const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true,
        max: 64
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    isActivated: {
        required: true,
        type: Boolean,
        default: false
    },
    isAdmin: {
        required: true,
        type: Boolean,
        default: false
    },
    uuid: {
        type: String,
        required: true,
        unique: true
    }


}, { timestamps: true });
module.exports = mongoose.model("User", UserSchema);