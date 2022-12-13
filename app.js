//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser"); // Body Parser
const ejs = require("ejs"); // Templating Engine
const session = require("express-session"); // Session Library
const passport = require("passport"); // Authentication Library
const passportLocalMongoose = require("passport-local-mongoose"); // Authentication Library
const GoogleStrategy = require("passport-google-oauth20").Strategy; // Authentication Library
const findOrCreate = require("mongoose-findorcreate"); // Authentication Library

// Environment Variables
const dotenv = require("dotenv"); // Environment Variables
require("dotenv").config();

// Express
const app = express();
// Set the view engine to ejs
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// Session
app.use(
    session({
        secret: "Our little secret.",
        resave: false,
        saveUninitialized: false,
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
const colors = require("colors");
const mongoose = require("mongoose");
mongoose
    .set("strictQuery", true)
    .connect("mongodb://0.0.0.0:27017/UserDB", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then((res) => console.log("> Connected...".green))
    .catch((err) =>
        console.log(`> Error while connecting to mongoDB : ${err.message}`.underline.red)
    );

// User Schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
});

// Passport Local Mongoose
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

// User Model
const User = new mongoose.model("User", userSchema);

// Passport Local Mongoose
passport.use(User.createStrategy());

// Passport Serialize and Deserialize
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// Google OAuth
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/secrets",
            userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
        },
        function (accessToken, refreshToken, profile, cb) {
            User.findOrCreate({ googleId: profile.id }, function (err, user) {
                return cb(err, user);
            });
        }
    )
);

// Routes
// Home - GET Request
app.get("/", function (req, res) {
    res.render("home");
});

// Google OAuth - GET Request
app.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile"],
    })
);

// Google OAuth - GET Request
app.get(
    "/auth/google/secrets",
    passport.authenticate("google", {
        failureRedirect: "/login",
    }),
    function (req, res) {
        // Successful authentication, redirect secrets.
        res.redirect("/secrets");
    }
);

// Login - GET Request
app.get("/login", function (req, res) {
    res.render("login");
});

// Register - GET Request
app.get("/register", function (req, res) {
    res.render("register");
});

// Submit - GET Request
app.get("/submit", function (req, res) {
    res.render("submit");
});

// Secrets - GET Request
app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

// Regiser - POST Request
app.post("/register", function (req, res) {
    User.register(
        {
            username: req.body.username,
        },
        req.body.password,
        function (err, user) {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/secrets");
                });
            }
        }
    );
});

// Login - POST Request
app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password,
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets");
            });
        }
    });
});

// Logout - GET Request
app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

// Start the server
const port = 3000 || process.env.PORT;
app.listen(port, function () {
    console.log("Server started on http://localhost:" + port);
});
