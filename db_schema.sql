-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    blog TEXT,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS articles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL,
    created DATETIME DEFAULT (datetime('now', 'localtime')),
    last_change DATETIME DEFAULT (datetime('now', 'localtime')),
    published DATETIME,
    likes INTEGER DEFAULT 0,
    removed_from_publication_views DATETIME,
    views INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    article_id INTEGER,
    created TIMESTAMP DEFAULT (datetime('now', 'localtime')),
    comment TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (article_id) REFERENCES articles(article_id)
);

-- Insert default data (if necessary here)

-- Set up three users
INSERT INTO users (first_name, last_name, email, password) VALUES ('Simon', 'Star', 'simon@gmail.com', 'password1');
INSERT INTO users (first_name, last_name, email, password) VALUES ('Dianne', 'Dean', 'dianne@yahoo.co.uk', 'password2');
INSERT INTO users (first_name, last_name, email, password) VALUES ('Harry', 'Hilbert', 'harry@hotmail.com', 'password3');



COMMIT;
