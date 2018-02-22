const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const hb = require("express-handlebars");
var spicedPg = require("spiced-pg");
var cookieSession = require("cookie-session");

var { dbUser, dbPass } = require("./secrets.json");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/signatures`);

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
    res.render("welcome", {
        layout: "main"
    });
});

app.post("/", (req, res) => {
    if (req.body.first && req.body.last && req.body.signature) {
        const q = `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`;
        const params = [req.body.first, req.body.last, req.body.signature];

        //we want back the id
        // result.rows will return the ID

        //in the post route, when the user has submitted the sig, delete the res.cookie('hasCookie', true)
        //then do:
        //req.session.signatureId = results.rows[0].id
        //if(req.session.signatureId) { }
        //SELECT signature FROM signatures WHERE id = req.session.signatureId;

        db
            .query(q, params)
            .then(() => {
                console.log("Insert new signature was successful");
                res.render("/thankyou", {
                    signature: params.rows[0].signature
                });
            })
            .catch(() => res.render("/welcome"), { error: true });
    } else {
        res.render("welcome", {
            layout: "main",
            error: true
        });
    }
});

app.listen(8080, () => {
    console.log("Listening Petition");
});
