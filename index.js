const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const db = require("./config/db.js");
const bcrypt = require("bcryptjs");
const insertSignatures = db.insertSignatures;
const getSignature = db.getSignature;
const getSignedNames = db.getSignedNames;
const countSignatures = db.countSignatures;
const insertRegistrationInfo = db.insertRegistrationInfo;
const getUserInfo = db.getUserInfo;

var id;
var userId;

function hashPassword(plainTextPassword) {
    return new Promise(function(resolve, reject) {
        bcrypt.genSalt(function(err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function(err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
}

function checkPassword(textEnteredInLoginForm, hashedPasswordFromDatabase) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
}

app.use(bodyParser.urlencoded({ extended: false }));

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static(__dirname + "/public"));

app.use(
    cookieSession({
        secret: "a really hard to guess secret",
        //put it in secrets json file

        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

app.get("/", (req, res) => {
    if (!req.session.signatureId) {
        res.render("welcome", {
            layout: "main"
        });
    } else {
        res.redirect("/thankyou");
    }
});

app.post("/", (req, res) => {
    if (req.body.first && req.body.last && req.body.signature) {
        insertSignatures(req.body.first, req.body.last, req.body.signature)
            .then(results => {
                req.session.signatureId = results.rows[0].id;
                res.redirect("/thankyou");
            })
            .catch(() => {
                res.render("welcome", {
                    error: true
                });
            });
    } else {
        res.render("welcome", {
            layout: "main",
            error: true
        });
    }
});

///ADD countSignatures TO THE THANK YOU PAGE!

app.get("/thankyou", (req, res) => {
    if (req.session.signatureId) {
        //console.log(req.session.signatureId);
        getSignature(req.session.signatureId).then(idResults => {
            res.render("thankyou", {
                layout: "main",
                signature: idResults.rows[0].signature
            });
        });
    }
});

app.post("/register", (req, res) => {
    if (
        req.body.first &&
        req.body.last &&
        req.body.email &&
        req.body.password
    ) {
        hashPassword(req.body.password)
            .then(hash =>
                insertRegistrationInfo(
                    req.body.first,
                    req.body.last,
                    req.body.email,
                    hash
                ).then(insertRegistrationInfo => {
                    id = insertRegistrationInfo.rows[0].id;
                    req.session.id = id;
                    console.log(
                        "This is your id: " + insertRegistrationInfo.rows[0].id
                    );
                    console.log("You've registered");
                    res.redirect("/");
                })
            )
            .catch(() => {
                res.render("register", {
                    error: true
                });
            });
    } else {
        res.render("register", {
            layout: "main",
            error: true
        });
    }
});

app.get("/login", (req, res) => {
    if (userId) {
        res.redirect("/");
    } else {
        res.render("login", {
            layout: "main"
        });
    }
});

app.post("/login", (req, res) => {
    if (req.body.email && req.body.password) {
        getUserInfo(req.body.email)
            .then(hashedPassword =>
                checkPassword(
                    req.body.password,
                    hashedPassword.rows[0].password
                ).then(value => {
                    if (value === true) {
                        userId = hashedPassword.rows[0].id;
                        let first = hashedPassword.rows[0].first;
                        let last = hashedPassword.rows[0].last;

                        req.session.userId = userId;
                        res.render("welcome", {
                            layout: "main"
                        });
                    } else {
                        console.log("We are here");
                        res.render("login", {
                            error: true
                        });
                    }
                    //check if it correct, set the session and redirect, otherwise render an error
                })
            )
            .catch(err => {
                console.log("We are here 2", err);
                res.render("login", {
                    error: true
                });
            });
    } else {
        console.log("We are here 3");
        res.render("login", {
            layout: "main",
            error: true
        });
    }
});

app.get("/signed", (req, res) => {
    getSignedNames().then(signedNames => {
        console.log(signedNames);
        res.render("signed", {
            layout: "main",
            signedNames: signedNames.rows
        });
    });
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main"
    });
});

app.listen(8080, () => {
    console.log("Listening Petition");
});
