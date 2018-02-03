//Movie Server Application

var express = require("express");
var app = express();
var request = require("request");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var passport = require("passport");
var User = require("./models/user");
var LocalStrategy = require("passport-local");
var Movie = require("./models/movies");
var favicon = require("serve-favicon");
var fs = require("fs");
var indexRoutes = require("./routes/index");
var resultsRoutes = require("./routes/results");
var reviewsRoutes = require("./routes/reviews");

//Passport confguration
app.use(require("express-session")({
    secret: "Encryption Phrase",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
//app.use(favicon(__dirname + '/public/images/favicon.ico'));

//Mongoose setup local
//mongoose.connect("mongodb://localhost/movie");

//Mongoose setup external
mongoose.connect("mongodb://<DB info>@ds117758.mlab.com:17758/movies");


app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.use(indexRoutes);
app.use(reviewsRoutes);
app.use(resultsRoutes);


app.listen(3000, function() {
    console.log("Server started [Port 3000]...");
});
