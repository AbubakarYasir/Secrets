//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

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

// Secrets - GET Request
app.get("/secrets", function (req, res) {
    res.render("secrets");
});

// Submit - GET Request
app.get("/submit", function (req, res) {
    res.render("submit");
});

app.listen(3000, function () {
    console.log("Server started on http://localhost:" + 3000);
});
