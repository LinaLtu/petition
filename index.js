const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const db = require("./config/db.js");
const bcrypt = require("bcryptjs");
const csrf = require("csurf");

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
const insertIntoProfileInfoUsers = db.insertIntoProfileInfoUsers;
const updatePassword = db.updatePassword;
const insertIntoUserProfileInfo = db.insertIntoUserProfileInfo;
const checkIfUserProfileRowExists = db.checkIfUserProfileRowExists;
const updateUsersTable = db.updateUsersTable;
const updateProfileInfoUsers = db.updateProfileInfoUsers;
const deleteSignature = db.deleteSignature;

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
        secret: process.env.SESSION_SECRET || "a really hard to guess secret",

        maxAge: 1000 * 60 * 60 * 24 * 14
    })
);

var csrfProtection = csrf();

app.get("/", (req, res) => {
    if (!req.session.userId && !req.session.signatureId) {
        res.redirect("/register");
    } else if (!req.session.signatureId) {
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
    console.log(req.session);
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

app.post("/register", csrfProtection, (req, res) => {
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

app.get("/login", csrfProtection, (req, res) => {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        res.render("login", {
            layout: "main",
            csrfToken: req.csrfToken()
        });
    }
});

app.post("/login", csrfProtection, (req, res) => {
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

app.get("/register", csrfProtection, (req, res) => {
    if (req.session.userId) {
        res.redirect("/profile");
    } else {
        res.render("register", {
            layout: "main",
            csrfToken: req.csrfToken()
        });
    }
});

app.get("/profile", csrfProtection, (req, res) => {
    res.render("profile", {
        layout: "main",
        csrfToken: req.csrfToken()
    });
});

app.get("/profile/edit", csrfProtection, (req, res) => {
    populateEditFields(req.session.userId).then(infoForEdit => {
        res.render("edit", {
            layout: "main",
            infoForEdit: infoForEdit.rows[0],
            csrfToken: req.csrfToken()
        });
    });
});

app.post("/profile/edit", csrfProtection, (req, res) => {
    //we run an update on two tables
    //one of the conditions: if a user doesn't have a row for optional info, (SELECT and then: if they don't have a row => INSERT, if they do -> UPDATE)
    //or add a row as soon as an user is created

    const { first, last, email, password, age, city, url } = req.body;

    const { userId } = req.session;

    function checkAndInsterUserProfiles() {
        checkIfUserProfileRowExists(userId).then(doesExist => {
            console.log("Does exist ", doesExist);
            if (!doesExist) {
                // console.log("Row does not exist");
                if (isNaN(age)) {
                    res.redirect("/profile/edit");
                } else {
                    insertIntoProfileInfoUsers(userId, age, city, url);
                    res.redirect("/");
                }
            } else {
                console.log("Req.body inside of checkUserInfo ", req.body);
                if (isNaN(age)) {
                    res.redirect("/profile/edit");
                } else {
                    updateProfileInfoUsers(age, city, url, userId);
                    console.log("Data inserted: ", age, city, url, userId);
                    res.redirect("/");
                }
            }
        });
    }

    if (password) {
        hashPassword(password).then(hash => {
            updatePassword(hash).then(() => {
                updateUsersTable(first, last, email, userId).then(() => {
                    checkAndInsterUserProfiles().then(() => res.redirect("/"));
                });
            });
        });
    } else {
        updateUsersTable(first, last, email, userId).then(() => {
            checkAndInsterUserProfiles().then(() => res.redirect("/"));
        });
    }
});

app.post("/profile", csrfProtection, (req, res) => {
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

app.get("/profile/delete", (req, res) => {
    console.log("We are deleting");
    deleteSignature(req.session.userId)
        .then(() => delete req.session.signatureId)
        .then(() => (req.session.funky = "chicken"))
        .then(() => console.log(req.session))
        .then(() => res.redirect("/"))
        .catch(err => {
            console.log("Something went wrong", err);
            res.render("profile", {
                layout: "thankyou"
            });
        });
});

app.listen(process.env.PORT || 8080, function() {
    console.log("Listening Petition");
});
