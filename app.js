if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");

const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const methodOverride = require("method-override");
const campground = require("./models/campground");
const comment = require("./models/comment");
const user = require("./models/user");
const email = require("./models/email");
const seedDB = require("./seeds");
// requiring routes
const commentRouters = require("./routes/comments");
const campgroundRoutes = require("./routes/campgrounds");
const emailRoutes = require("./routes/emails");
const indexRoutes = require("./routes/index");

const MongoClient = require("mongodb").MongoClient;

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Mongoose"));

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();
// pasport configuration
app.use(
  require("express-session")({
    secret: "once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRouters);
app.use("/emails", emailRoutes);
app.use(express.static("public"));

app.listen(process.env.PORT || 3000, () => {
  console.log("Listing");
});
