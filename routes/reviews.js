//Routes for handling reviews

var express = require("express");
var router = express.Router();
var request = require("request");
var Movie = require("../models/movies");
var Review = require("../models/review");
var middleware = require("../middleware");


router.get("/movies/:id/review", function(req, res) {
    Movie.findById(req.params.id, function(err, foundMovie) {
        if(err) {
            console.log(err);
        } else {
            res.render("rating", {movie: foundMovie});
        }
    });
});

//New review route
router.post("/movies/:id/review", middleware.isLoggedIn, function(req, res) {
    Movie.findById(req.params.id, function(err, foundMovie) {
        if(err) {
            console.log(err);
        }
        else {
            Review.create(req.body.review, function(err, review) {
                if(err) {
                    console.log(err);
                }
                
                else {
                    review.author.id = req.user._id;
                    review.author.username = req.user.username;
                    review.save();
                    foundMovie.reviews.push(review.id);
                    foundMovie.save((err) => {if(err) {console.log(err)} });
                }
            });
        }
	res.redirect("/movies/" + foundMovie._id);
    });
});

//Edit route

//Delete route
router.delete("/movies/:id/reviews/:review_id", function(req, res) {
console.log(typeof req.params.review_id + ' | ' + req.params.review_id);
    Review.findByIdAndRemove(req.params.review_id, function(err) {
        if(err) {
            console.log(err);
            res.redirect("/movies");
        }
        else {
            res.redirect("/movies/:id");
        }
    });
});


module.exports = router;
