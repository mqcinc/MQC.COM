const express = require("express");

const router = express.Router();
const passport = require("passport");
const user = require("../models/user");
// root route
router.get("/", (req, res) => {
  res.render("landing");
});
// show register form route
router.get("/register", (req, res) => {
  res.render("register", { page: "register" });
});
// HANDLE SIGN UP LOGIC
router.post("/register", (req, res) => {
  var newUser = new User({ username: req.body.username });
  if (req.body.adminCode === "secretcode123") {
    newUser.isAdmin = true;
  }

  // const newuser = new user({ username: req.body.username });
  user.register(newuser, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      return res.render("register", { error: err.message });
    }
    passport.authenticate("local")(req, res, () => {
      req.flash("success", "Welcome to MAC inc " + user.username);
      res.redirect("/campgrounds");
    });
  });
});
// show login form
router.get("/login", (req, res) => {
  res.render("login", { page: "login" });
});
// handing login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);
// logout route
router.get("/logout", (req, res) => {
  req.logOut();
  req.flash("success", "Logged you out");
  res.redirect("/campgrounds");
});
// contact
router.get("/teams", (req, res) => {
  res.render("teams", { page: "teams" });
});
router.get("/about", (req, res) => {
  res.render("about", { page: "about" });
});
router.get("/services", (req, res) => {
  res.render("services", { page: "services" });
});

module.exports = router;
