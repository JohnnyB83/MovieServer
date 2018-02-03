//Routes to handle the IMDB results

var express = require("express");
var router = express.Router();
var request = require("request");
var imdb = require("imdb-api");


//Show route for IMDB query

router.get("/results", function(req, res) {
    var resultsData;
    var searchTerm = req.query.search;
    var test = req.query.sort;
    var type = req.query.type;
    
    var moviesLength;
    var currentMovie = 0;
    var searchLimit = 10;
    
    var Movie = imdb.search({title: searchTerm}, {apiKey: '4bae2afc', timeout: 30000});
    
    Movie.then(function(movie) {
        function render() {
            res.render("search/results", {sort: test, info: fullInfo});
        }
            var fullInfo = [];
        moviesLength = movie.results.length;
        movie.results.forEach(function(moreInfoTitles) {
            var detail = imdb.get(moreInfoTitles.title, {apiKey: '4bae2afc', timeout: 30000});
            detail.then(function(moreInfoContent) {
                fullInfo.push(moreInfoContent);
                currentMovie++;
                if(currentMovie == moviesLength || currentMovie == searchLimit) {
                    render();
                }
            });
            
            detail.catch(function(response) {
                console.log("Error in getting more info: " + response.message);
            });
        });
    });
    Movie.catch(function(response) {
        console.log("Error: " + response.message);
        res.send("Error: " + response.message);
    });
});

module.exports = router;
