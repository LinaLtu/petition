DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
     -- user_id INTEGER NOT NULL,     
     -- a foreign key
    first VARCHAR(200) NOT NULL,
    last VARCHAR(200) NOT NULL,
    signature TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

