DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS user_profiles;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
     -- a foreign key
    -- first VARCHAR(200) NOT NULL,
    -- last VARCHAR(200) NOT NULL,
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
