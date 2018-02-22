var spicedPg = require("spiced-pg");

var { dbUser, dbPass } = require("./secrets");

var db = spicedPg(`postgres:${dbUser}:${dbPass}@localhost:5432/cities`);
//
// function getCityInfo(city, country) {
//     db
//         .query("SELECT city FROM cities WHERE city = $1 AND country = $2", [
//             city,
//             country
//         ])
//         .then(function(results) {
//             console.log(results.rows);
//         })
//         .catch(function(err) {
//             console.log(err);
//         });
// }

//Insert

db
    .query(
        `INSERT INTO cities (city, population, country) VALUES ('Palermo', 300000, 'Italy')`
    )

    .then(() => {
        return db.query(`SELECT city FROM cities`).then(function(results) {
            console.log(results.rows);
        });
    })
    .catch(function(err) {
        console.log(err);
    });
