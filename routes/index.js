//Routes for handling movie editing and use cases

var express = require("express");
var router = express.Router();
var Movie = require("../models/movies");
var passport = require("passport");
var User = require("../models/user");
var middleware = require("../middleware");
var Review = require("../models/review");
var fs = require("fs");
var imdb = require("imdb-api");
var exec = require("child_process").exec;

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//Index route
router.get("/", function(req, res) {
    res.render("search/search");
});

//Movie index route where all movies in DB shown
router.get("/movies", middleware.isLoggedIn, function(req, res) {
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Movie.find({title: regex}, function(err, movies) {
            if(err) {
                console.log(err);
            }
            else {
                res.render("index", {movies: movies});
            }
        });
    }
    
    else {
        
        Movie.find({}, function(err, movies) {
            if(err) {
                console.log(err);
            }
            else {
                res.render("index", {movies: movies});
            }
        });
    }
});

//Watch movie route
router.get("/movies/:id/watch", middleware.isLoggedIn, function(req, res) {
    Movie.findById(req.params.id, function(err, foundMovie) {
        if(err) {
            console.log("Error movie not found");
        }
        
        else {
             try {
                 var path = foundMovie.watchPath;
                 var stat = fs.statSync(path);
                 var fileSize = stat.size;
                 var range = req.headers.range;
             }
             catch(err) {
                 console.log("File does not exist");
		 res.redirect("/movies");
		 return -1;
             }
            
             if(range) {
                 var parts = range.replace(/bytes=/, "").split("-");
                 var start = parseInt(parts[0], 10);
                 var end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
                 const chunksize = (end-start)+1
                 const file = fs.createReadStream(path, {start, end})
                 const head = {
                 'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                 'Accept-Ranges': 'bytes',
                 'Content-Length': chunksize,
                 'Content-Type': 'video/mp4',
		 'Transfer-Encoding' : 'chunked'
                 }
                 res.writeHead(206, head);
		 //res.status(206);
		 //res.set(head);
                 file.pipe(res);
             } else {
	           const head = {
                         'Content-Length': fileSize,
                         'Content-Type': 'video/mp4',
                                }
                   res.writeHead(200, head)
                   //res.status(200);
                   //res.set(head);
                   fs.createReadStream(path).pipe(res)
             }
        }
    });
});

//Render watch route
router.get("/movies/:id/watch/view", middleware.isLoggedIn, function(req, res) {
    Movie.findById(req.params.id, function(err, foundMovie) {
        if(err) {
            console.log("Error movie not found");
        }
	else {
	    res.render("movies/watch", {movie: foundMovie});
	}
    });
});

//Create new movie with form route 
router.get("/movies/new", middleware.isLoggedIn, function(req, res) {
    var diskSize;
    exec("df -h --total | grep /dev/sda1", function(err, stdout, stderr) {
        if(err) {
	    console.log(err);
	    res.render("movies/new", {diskSize: new Array(15)});
	}
        else if(stdout) {
	    diskSize = stdout.split(' ');
	    res.render("movies/new", {diskSize: diskSize});
	}
	else {
	    console.log(stderr);
            res.redirect("/movies");
	}
    });
});

//Create new movie with IMDB lookup and form
router.post("/movies/newIMDB", middleware.isLoggedIn, function(req, res) {
    var Movie = imdb.getById(req.body.imdbSearch, {apiKey: '4bae2afc', timeout: 30000});
    
    Movie.then(function(movie) {
        res.render("movies/newimdb",{movie: movie});
    });
    
    Movie.catch(function(err) {
        console.log(err.message);
    });
});

//Show page
router.get("/movies/:id", middleware.isLoggedIn, function(req, res) {
    Movie.findById(req.params.id).populate("reviews").exec(function(err, foundMovie) {
        if(err) {
            res.redirect("/movies");
        } else {
            var totalReviews = foundMovie.reviews.length;
            var sumReview = 0;
            foundMovie.reviews.forEach(function(review) {
                sumReview += Number(review.stars);
            });
            var avgReview = Math.floor(sumReview/totalReviews);
            res.render("movies/show", {movie:foundMovie, avgReview: avgReview});
        }
    });
});

//Create route for putting movies into the database
router.post("/movies", middleware.isLoggedIn, function(req, res) {
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var title = req.body.movie.title;
    var image = req.body.movie.image;
    var genre = req.body.movie.genre;
    var rating = req.body.movie.rating;
    var director = req.body.movie.director;
    var plot = req.body.movie.plot;
    var path = req.body.movie.watchPath;
    var movieInfo = {
        title: title,
        image: image,
        genre: genre,
        rating: rating,
        director: director,
        plot: plot,
        watchPath: path,
        author: author
    };
    Movie.create(movieInfo, function(err, blog) {
        if(err) {
            console.log(err);
        }
        else {
            res.redirect("/movies");
        }
    });
});

//Edit route
router.get("/movies/:id/edit", middleware.isLoggedIn, function(req, res) {
    Movie.findById(req.params.id, function(err, foundMovie) {
        if(err) {
            res.redirect("/movies");
        }
        else {
            res.render("movies/edit", {movie: foundMovie});
        }
    });
});

//Update route
router.put("/movies/:id", middleware.isLoggedIn, function(req, res) {
    Movie.findByIdAndUpdate(req.params.id, req.body.movie, function(err, updatedMovie) {
        if(err) {
            res.redirect("/movies");
        }
        else {
            res.redirect("/movies/" + req.params.id);
        }
    });
});


//Delete route
router.delete("/movies/:id", middleware.isLoggedIn, function(req, res) {
    Movie.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            res.redirect("/movies");
        }
        else {
            res.redirect("/movies");
        }
    });
});

// --- Auth routes ---

//Show register form
router.get("/register", function(req, res) {
    res.render("register");
});

//Handle sign up logic
router.post("/register", function(req, res) {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user) {
        if(err) {
            return res.render("register");
        }
        //Add email
        user.email = req.body.email;
        user.save();
        passport.authenticate("local")(req, res, function() {
            res.redirect("/movies");
        });
    });
});

//Show login form
router.get("/login", function(req, res) {
    res.render("login");
});

//Handle login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/movies",
    failureRedirect: "/login"}), function(req, res) {
        
    
});

//Admin page
router.get("/upkeep", middleware.isAdmin, function(req, res) {
    User.find({}, function(err, users) {
        if(err) {
            console.log(err);
        }
        else {
            res.render("admin", {users: users});
        }
    });
});

//Admin delete user route
router.delete("/upkeep/:id", middleware.isAdmin, function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err) {
        if(err) {
            console.log(err);
            res.redirect("/movies");
        }
        else {
            res.redirect("/upkeep");
        }
    });
});

//Admin update route
router.put("/upkeep/:id", middleware.isAdmin, function(req, res) {
    User.findByIdAndUpdate(req.params.id, {$set: {isAdmin : true}}, function(err, updatedMovie) {
        if(err) {
            res.redirect("/movies");
        }
        else {
            res.redirect("/upkeep");
        }
    });
});


//Logout route
router.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});



module.exports = router;
