// all middleware
const campground = require("../models/campground");
const comment = require("../models/comment");
const email = require("../models/email");
const middlewareObj = {};
middlewareObj.checkCampgroundOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    // does the uder own the campground
    campground.findById(req.params.id, (err, foundCampground) => {
      if (err || !foundCampground) {
        // req.flash("error", "Campground not found ");
        res.redirect("back");
      } else {
        if (foundCampground.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "you don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", " You need to be logged in to do that");
    res.redirect("back");
  }
};
middlewareObj.checkCommentOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    comment.findById(req.params.comment_id, function (err, foundComment) {
      if (err || !foundComment) {
        res.redirect("back");
      } else {
        // does user own the comment?
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};
middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
};

module.exports = middlewareObj;
