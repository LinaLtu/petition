const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const db = require("./config/db.js");
const pg = require("pg");
const csrf = require('csurf')

//method #1:
app.use(csrf())
//if we want our middleware to affect all of our routs :
//middleware is as a route without a route

//method #2:
let csrfProtection = csrf() //we need to pass it as middleware app.get("/", csrfProtection, (req, res) => {

app.use(function(req, res, next) {
    if (req.session.user.id) {
        res.redirect("/");
    }
});

app.get("/", (req, res) => {
    res.render("index", {
        csrfToken: req.csrfToken()
    });
});

app.post('/', (req, res) => {
    res.send("Good Job")
}

//OR: (only use this middleware for routs that requite a sigId, like GET /signers, GET /thankyou, GET /signers/:city )
//use this for any route that require being logged in = every page except registration and login

const checkForSigId = function(req, res, next) {
    if (!req.session.user.sigId) {
        res.redirect("/");
    } else {
        next();
    }
};

const checkForLoggedIn = function(req, res, next) {
    if (!req.session.user) {
        res.redirect("/register");
    } else {
        next();
    }
};

app.get("/signers", checkForLoggedIn, checkForSigId, (req, res) => {});
app.get("/thankyou", checkForLoggedIn, checkForSigId, (req, res) => {});
app.get("/signers/:city", checkForLoggedIn, checkForSigId, (req, res) => {});

//we can order out routs in a specific way

app.get("/login", checkForLoggedIn, (req, res) => {});
app.get("/registration", checkForLoggedIn, (req, res) => {});

app.use(checkForSigId);

app.get("/signers", checkForLoggedIn, (req, res) => {});
app.get("/thankyou", checkForLoggedIn, (req, res) => {});
app.get("/signers/:city", checkForLoggedIn, (req, res) => {});
