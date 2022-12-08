//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser"); // Body Parser
const ejs = require("ejs"); // Templating Engine
const bcrypt = require("bcrypt"); // Hashing Library

const app = express();
// Set the view engine to ejs
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

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

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = new mongoose.model("User", userSchema);

// Home - GET Request
app.get("/", function (req, res) {
    res.render("home");
});

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

// Regiser - POST Request
app.post("/register", function (req, res) {
    // Hash and Store the User Password
    bcrypt.hash(req.body.password, 12, function (err, hash) {
        const newUser = new User({
            email: req.body.username,
            password: hash,
        });
        // Find if there is a user with the same email
        User.findOne({ email: newUser.email }, function (err, foundUser) {
            if (err) {
                console.log(err);
            } else {
                // If there is no user with the same email, save the new user
                if (foundUser == null && newUser.email != "") {
                    newUser.save(function (err) {
                        if (err) {
                            console.log(err);
                        }
                        // If the user is saved, render the secrets page
                        else {
                            res.render("secrets");
                            console.log("New User has successfully registered:");
                        }
                    });
                }
                // If there is a user with the same email, render the register page again.
                else {
                    res.render("register");
                    console.log("User already exists!");
                }
            }
        });
    });
});

// Login - POST Request
app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    // Find the user with the same email
    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        }
        // If the user is found, compare the password
        else {
            if (foundUser != null) {
                bcrypt.compare(password, foundUser.password, function (err, result) {
                    if (result == true) {
                        res.render("secrets");
                    } else {
                        res.render("login");
                        console.log("Wrong password!");
                    }
                });
            } // If the user is not found, render the login page again.
            else if (foundUser == null) {
                res.render("login");
                console.log("User not found!");
            }
        }
    });
});

// Start the server
const port = 3000 || process.env.PORT;
app.listen(port, function () {
    console.log("Server started on http://localhost:" + port);
});
