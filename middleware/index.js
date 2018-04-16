//All middleware

var middlewareObj = {};

// middlewareObj.checkPointOwnership = function(req, res, next) {
//     if(req.isAuthenticated()) {
//         Point.findById(req.params.id, function(err, foundPoint) {
//             if(err || !foundPoint) {
//                 req.flash("error", "Point not found");
//                 res.redirect("back");
//             }
            
//             else {
//                 if(foundPoint.author.id.equals(req.user._id)) {
//                     next();
//                 }
                
//                 else {
//                     //User is different
//                     req.flash("error", "Insufficient permissions")
//                     res.redirect("back");
//                 }
//             }
//         });
//     }
    
//     else {
//         req.flash("error", "Login first!")
//         res.redirect("back");
//     }
// }


middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    console.log("Not logged in");
    res.redirect("/login");
}

middlewareObj.isAdmin = function(req, res, next) {
    if(req.isAuthenticated() && req.user.isAdmin === true) {
        return next()
    }
    console.log("Not admin");
    res.redirect("/movies");
}

module.exports = middlewareObj;
