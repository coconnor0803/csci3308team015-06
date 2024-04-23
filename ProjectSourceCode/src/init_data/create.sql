CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password TEXT NOT NULL
);

CREATE TABLE study_sets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    user_username VARCHAR(50),  -- Adjusted data type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_username) REFERENCES users(username)
);

CREATE TABLE terms (
    id SERIAL PRIMARY KEY,
    term VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    study_set_id INTEGER REFERENCES study_sets(id) ON DELETE CASCADE
);
