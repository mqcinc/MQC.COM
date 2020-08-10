const mongoose = require("mongoose");
const passwordLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
});
userSchema.plugin(passwordLocalMongoose);

module.exports = mongoose.model("user", userSchema);
