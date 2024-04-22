CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);

CREATE TABLE study_sets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_username VARCHAR(50) REFERENCES users(username) ON DELETE CASCADE
);

CREATE TABLE terms (
    id SERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    study_set_id INTEGER REFERENCES study_sets(id) ON DELETE CASCADE
);
