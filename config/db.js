var spicedPg = require("spiced-pg");

var { dbUser, dbPass } = require("../secrets.json");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/signatures`);

function insertSignatures(signature, user_id) {
    const q = `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id`;
    const params = [signature, user_id];

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

function insertProfileInfo(age, city, url, user_id) {
    const q = `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4)`;
    const params = [age, city, url, user_id];
    console.log(params);

    return db
        .query(q, params)
        .then(profileInfo => {
            console.log("You profile has been updated");
            return profileInfo;
        })
        .catch(err => console.log(err));
}

function getSignedInfo() {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM users
    JOIN user_profiles
    ON users.id = user_id`;

    return db
        .query(q)
        .then(signedInfo => {
            return signedInfo;
        })
        .catch(err => console.log(err));
}

function getSignedInfoByCity(city) {
    const q = `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.url FROM users
    JOIN user_profiles
    ON users.id = user_id
    WHERE city = $1`;

    const param = [city];

    return db
        .query(q, param)
        .then(signedInfoByCity => {
            return signedInfoByCity;
        })
        .catch(err => console.log(err));
}

function populateEditFields(user_id) {
    const q = `SELECT users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url FROM users
    JOIN user_profiles
    ON users.id = user_id
    WHERE user_id = $1`;

    const param = [user_id];

    return db
        .query(q, param)
        .then(infoForEdit => {
            return infoForEdit;
        })
        .catch(err => console.log(err));
}

module.exports.insertSignatures = insertSignatures;
module.exports.getSignature = getSignature;
module.exports.getSignedNames = getSignedNames;
module.exports.countSignatures = countSignatures;
module.exports.insertRegistrationInfo = insertRegistrationInfo;
module.exports.getUserInfo = getUserInfo;
module.exports.insertProfileInfo = insertProfileInfo;
module.exports.getSignedInfo = getSignedInfo;
module.exports.getSignedInfoByCity = getSignedInfoByCity;
module.exports.populateEditFields = populateEditFields;
