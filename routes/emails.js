var express = require("express");
var router = express.Router();
var datas = require("../models/email");
var middleware = require("../middleware");
const middlewareObj = require("../middleware");
const email = require("../models/email");

//Comments New
router.get("/", middleware.isLoggedIn, async (req, res) => {
  // find campground by id
  try {
    const allEmails = await datas.find({});
    res.render("emails", { allEmails: allEmails });
  } catch (err) {
    res.redirect("/");
  }
});
router.post("/", async (req, res) => {
  const newEmail = new datas({
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
  });
  // create a new email and save it to database
  try {
    const contact = await newEmail.save();
    res.redirect("/campgrounds");
  } catch (err) {
    req.flash("error", err.message);
    return res.redirect("back");
  }
});

router.get("/new", (req, res) => {
  res.render("emails/new");
});

module.exports = router;
