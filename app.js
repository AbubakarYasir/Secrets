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

app.listen(3000, function () {
    console.log("Server started on http://localhost:" + 3000);
});
