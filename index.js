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
const insertProfileInfo = db.insertProfileInfo;
const getSignedInfo = db.getSignedInfo;
const getSignedInfoByCity = db.getSignedInfoByCity;
const populateEditFields = db.populateEditFields;

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
    console.log(req.session.userId);
    if (req.body.signature) {
        insertSignatures(req.body.signature, req.session.userId)
            .then(results => {
                req.session.signatureId = results.rows[0].id;
                res.redirect("/thankyou");
            })
            .catch(() => {
                res.render("welcome", {
                    layout: "main",
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
    if (req.session.signatureId && req.session.userId) {
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
                    req.session.userId = id;
                    // console.log(
                    //     "This is your id: " + insertRegistrationInfo.rows[0].id
                    // );
                    // console.log("You've registered");
                    res.redirect("/profile");
                })
            )
            .catch(() => {
                res.render("register", {
                    layout: "main",
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
    if (req.session.userId) {
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
                        res.render("login", {
                            layout: "main",
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

app.get("/petition/signers", (req, res) => {
    getSignedInfo().then(signedInfo => {
        console.log(signedInfo);
        res.render("petition/signers", {
            layout: "main",
            signedInfo: signedInfo.rows,
            cityPage: true
        });
    });
});

app.get("/petition/signers/:city", (req, res) => {
    getSignedInfoByCity(req.params.city).then(signedInfoByCity => {
        res.render("petition/signers", {
            layout: "main",
            signedInfo: signedInfoByCity.rows,
            cityPage: false
        });
    });
});

app.get("/register", (req, res) => {
    if (req.session.userId) {
        res.redirect("/profile");
    } else {
        res.render("register", {
            layout: "main"
        });
    }
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main"
    });
});

app.get("/profile/edit", (req, res) => {
    populateEditFields(req.session.userId).then(infoForEdit => {
        res.render("edit", {
            layout: "main",
            infoForEdit: infoForEdit.rows[0]
        });
    });

    //query for the info an populate the info fields
    //don't populare the passwords field
});

app.post("/profile/edit", (req, res) => {
    //we run an updato on two tables
    //one of the conditions: if a user doesn't have a row for optional info, (SELECT and then: if they don't have a row => INSERT, if they do -> UPDATE)
    //or add a row as soon as an user is created

    const { first, last, email, password, age, city, url } = req.body;

    const { id } = req.session.user;

    //do two separare updates for two separete tables
});

app.post("/profile", (req, res) => {
    insertProfileInfo(
        req.body.age,
        req.body.city,
        req.body.url,
        req.session.userId
    )
        .then(res.redirect("/"))
        .catch(err => {
            console.log("Something went wrong", err);
            res.render("profile", {
                layout: "main",
                error: true
            });
        });
});

app.listen(8080, () => {
    console.log("Listening Petition");
});
