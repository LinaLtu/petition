var spicedPg = require("spiced-pg");

var { dbUser, dbPass } = require("../secrets.json");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/signatures`);

function insertSignatures(first, last, signature) {
    const q = `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`;
    const params = [first, last, signature];

    //we want back the id
    // result.rows will return the ID

    //in the post route, when the user has submitted the sig, delete the res.cookie('hasCookie', true)
    //then do:
    //req.session.signatureId = results.rows[0].id
    //if(req.session.signatureId) { }
    //SELECT signature FROM signatures WHERE id = req.session.signatureId;

    return db
        .query(q, params)
        .then(results => {
            console.log("Insert new signature was successful");
            return results;
        })
        .catch(err => console.log(err));
}

function getSignature(signatureId) {
    const q = `SELECT signature FROM signatures WHERE id = $1`;
    const param = [signatureId];

    return db
        .query(q, param)
        .then(idResults => {
            return idResults;
        })
        .catch(err => console.log(err));
}

module.exports.insertSignatures = insertSignatures;
module.exports.getSignature = getSignature;
