DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    signature TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR (255) NOT NULL,
    last VARCHAR (255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR (100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    age VARCHAR(4),
    city VARCHAR(30),
    url VARCHAR(300)
);


-- update

UPDATE user_profiles
SET city = "Malverne"
WHERE user_id = 1;

const q = `UPDATE user_profiles
SET city = $1
WHERE user_id = $2`
const params = [ userInputedCity || null, req.session,user.id]

INSERT INTO user_profiles
(city, age, url) VALUES ($1, $2, $3);
const params = [ userInputedCity || null, age || null, url || null]

const q = `DELETE FROM signatures
WHERE user_id = 1;`
const params = [req.session.user.signatureId]
-- then set req.session.user.signatureId= null
-- or delete req.session.user.signatureId

-- if(password === '') {
-- skip the whole updating the password Something
-- aka don't do the update query
-- } else {
-- update the password
-- }
