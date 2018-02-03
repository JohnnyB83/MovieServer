//Model file for storing movie information
var mongoose = require('mongoose');

var movieSchema = new mongoose.Schema({
    title: String,
    image: String,
    plot: String,
    genre: String,
    year: String,
    rating: String,
    IMDBScore: String,
    director: String,
    starring: String,
    runtime: String,
    watchPath: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    watched: Boolean
});

module.exports = mongoose.model("Movie", movieSchema);