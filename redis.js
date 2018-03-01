//in the index.js file:
const cache = require("/cache");
cache
    .setex("thing", 30, JSON.stringify ({
        funky: "chicken",
        disco: "duck"
    })
    .then(() => cache.get("thing"))
    .then(val => {
        console.log(val);
});

var redis = require("redis");
var client = redis.createClient({
    host: "localhost",
    port: 6379
});

client.on("error", function(err) {
    console.log(err);
});

client.set("funky", "chicken", function(err, data) {
    console.log(err, data);
});

client.get("funky", function(err, data) {
    console.log(err, data);
});

module.exports.get = function(key) {
    return new Promise(function(resolve, reject) {
        client.get(key, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

module.exports.setex = function(key, expiry, val) {
    return new Promise(function(resolve, reject) {
        client.setex(key, expiry, val, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

exports
    .setex("funky", 20, "chicken")
    .then(() => exports.get("funky"))
    .then(val => console.log(val));
