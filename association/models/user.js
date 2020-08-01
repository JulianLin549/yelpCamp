const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId, //array of object ids
    ref: "Post"
  }]
});
const User = mongoose.model("User", userSchema);


module.exports = User