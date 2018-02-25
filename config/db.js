var spicedPg = require("spiced-pg");

var { dbUser, dbPass } = require("../secrets.json");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/signatures`);

function insertSignatures(first, last, signature) {
    const q = `INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3) RETURNING id`;
    const params = [first, last, signature];

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

function getSignedNames() {
    const q = `SELECT first, last FROM signatures`;

    return db
        .query(q)
        .then(signedNames => {
            return signedNames;
        })
        .catch(err => console.log(err));
}

function countSignatures() {
    const q = `SELECT COUNT (*) FROM signatures`;

    return db
        .query(q)
        .then(signatureCount => {
            return signatureCount;
        })
        .catch(err => console.log(err));
}

function insertRegistrationInfo(first, last, email, password) {
    const q = `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    const params = [first, last, email, password];

    return db
        .query(q, params)
        .then(registrationResults => {
            console.log("Insert new signature was successful");
            return registrationResults;
        })
        .catch(err => console.log(err));
}

function getUserInfo(email) {
    const q = `SELECT * FROM users WHERE email = $1`;
    const param = [email];
    return db.query(q, param);
}

module.exports.insertSignatures = insertSignatures;
module.exports.getSignature = getSignature;
module.exports.getSignedNames = getSignedNames;
module.exports.countSignatures = countSignatures;
module.exports.insertRegistrationInfo = insertRegistrationInfo;
module.exports.getUserInfo = getUserInfo;
