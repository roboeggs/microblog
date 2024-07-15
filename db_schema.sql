-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    blog TEXT,
    password TEXT NOT NULL
);

-- Create the articles table
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

-- Create the comments table
CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    article_id INTEGER,
    created TIMESTAMP DEFAULT (datetime('now', 'localtime')),
    comment TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (article_id) REFERENCES articles(article_id)
);

-- Insert default data
INSERT INTO users (first_name, last_name, email, blog, password) VALUES ('Simon', 'Star', 'simon@gmail.com', 'Simon''s Blog', 'password1');
INSERT INTO users (first_name, last_name, email, blog, password) VALUES ('Dianne', 'Dean', 'dianne@yahoo.co.uk', 'Dianne''s Thoughts', 'password2');
INSERT INTO users (first_name, last_name, email, blog, password) VALUES ('Harry', 'Hilbert', 'harry@hotmail.com', 'Harry''s World', 'password3');

INSERT INTO articles (user_id, title, content, status) VALUES (1, 'First Article by Simon', 'This is the content of the first article by Simon.', 'pub');
INSERT INTO articles (user_id, title, content, status) VALUES (2, 'First Article by Dianne', 'This is the content of the first article by Dianne.', 'pub');
INSERT INTO articles (user_id, title, content, status) VALUES (3, 'First Article by Harry', 'This is the content of the first article by Harry.', 'pub');
INSERT INTO articles (user_id, title, content, status) VALUES (1, 'Second Article by Simon', 'This is the content of the second article by Simon.', 'draft');
INSERT INTO articles (user_id, title, content, status) VALUES (2, 'Second Article by Dianne', 'This is the content of the second article by Dianne.', 'draft');

INSERT INTO comments (user_id, article_id, comment) VALUES (2, 1, 'This is a comment by Dianne on Simon''s article.');
INSERT INTO comments (user_id, article_id, comment) VALUES (3, 1, 'This is a comment by Harry on Simon''s article.');
INSERT INTO comments (user_id, article_id, comment) VALUES (1, 2, 'This is a comment by Simon on Dianne''s article.');
INSERT INTO comments (user_id, article_id, comment) VALUES (3, 2, 'This is a comment by Harry on Dianne''s article.');
INSERT INTO comments (user_id, article_id, comment) VALUES (1, 3, 'This is a comment by Simon on Harry''s article.');
INSERT INTO comments (user_id, article_id, comment) VALUES (2, 3, 'This is a comment by Dianne on Harry''s article.');


COMMIT;
