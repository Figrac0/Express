const User = require("../models/user");

exports.getLogin = (req, res, next) => {
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        isAuthenticated: false,
    });
};

exports.postLogin = (req, res, next) => {
    User.findById("6992ed515c81b0aa0e778f48")
        .then((user) => {
            req.session.isLoggedIn = true;
            req.session.userId = user._id.toString();

            req.session.save((err) => {
                console.log(err);
                res.redirect("/");
            });
        })
        .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect("/");
    });
};
