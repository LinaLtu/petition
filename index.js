const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const db = require("./config/db.js");
const insertSignatures = db.insertSignatures;
const getSignature = db.getSignature;
const getSignedNames = db.getSignedNames;
const countSignatures = db.countSignatures;

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
    console.log("we are here");
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
        console.log(req.session.signatureId);
        getSignature(req.session.signatureId).then(idResults => {
            res.render("thankyou", {
                layout: "main",
                signature: idResults.rows[0].signature
            });
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

app.listen(8080, () => {
    console.log("Listening Petition");
});
