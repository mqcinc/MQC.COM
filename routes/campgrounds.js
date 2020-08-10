const express = require("express");
const router = express.Router();
const campground = require("../models/campground");
const middleware = require("../middleware/index");
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});
const imageFilter = (req, file, cb) => {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });

const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "djggna3o4",
  api_key: 898917983671131,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// index route
router.get("/", (req, res) => {
  // get all campgrounds from DB
  campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", {
        campgrounds: allCampgrounds,
        page: "campgrounds",
      });
    }
  });
});
// create route
router.post("/", middleware.isLoggedIn, upload.single("image"), (req, res) => {
  cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    // add cloudinary url for the image to the campground object under image property
    req.body.campground.image = result.secure_url;
    // add image's public_id to campground object
    req.body.campground.imageId = result.public_id;
    // add author to campground
    req.body.campground.author = {
      id: req.user._id,
      username: req.user.username,
    };
    campground.create(req.body.campground, (err, campground) => {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }

      res.redirect("/campgrounds/" + campground.id);
    });
  });
});

router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});
// SHOW = shoew more info about one campground
router.get("/:id", (req, res) => {
  // find the campground with provided ID
  campground
    .findById(req.params.id)
    .populate("comment")
    .exec((err, foundCampground) => {
      if (err || !foundCampground) {
        req.flash("error", "campground not found");
        res.redirect("back");
      } else {
        console.log(foundCampground);
        //render show template with that campground
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});

// EDIT CAMPGROUND ROUTE
router.get(
  "/:id/edit",
  middleware.checkCampgroundOwnership,
  (req, res, next) => {
    // is user logged in?

    campground.findById(req.params.id, (err, foundCampground) => {
      res.render("campgrounds/edit", { campground: foundCampground });
    });
  }
);

//UPDATE CAMPGROUND ROUTE
router.put("/:id", upload.single("image"), (req, res) => {
  campground.findById(req.params.id, async (err, campground) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      if (req.file) {
        try {
          await cloudinary.v2.uploader.destroy(campground.imageId);
          const result = await cloudinary.v2.uploader.upload(req.file.path);
          campground.imageId = result.public_id;
          campground.image = result.secure_url;
        } catch (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
      }
      campground.name = req.body.campground.name;
      campground.description = req.body.campground.description;
      campground.save();
      req.flash("success", "Successfully Updated!");
      res.redirect("/campgrounds/" + campground._id);
    }
  });
});
//delete campgrounds;
router.delete("/:id", (req, res) => {
  campground.findByIdAndDelete(req.params.id, (err) => {
    if (err) {
      res.redirect("/campgrounds");
    }

    res.redirect("/campgrounds");
  });
});
// router.delete("/:id", async (req, res) => {
//   try {
//     let foundCampground = await Campground.findById(req.params.id);
//     await foundCampground.remove();
//     res.redirect("/campgrounds");
//   } catch (error) {
//     console.log(error.message);
//     res.redirect("/campgrounds");
//   }
// });

module.exports = router;
