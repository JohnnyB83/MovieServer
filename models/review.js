//Model for reviews

var mongoose = require("mongoose");

var reviewSchema = mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    stars: String
});

module.exports = mongoose.model("Review", reviewSchema);