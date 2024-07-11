-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_accounts (
    email_account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT NOT NULL UNIQUE,
    user_id  INT, --the user that the email account belongs to
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS articles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    article_id INTEGER,
    comment TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (article_id) REFERENCES articles(article_id)
);

-- Insert default data (if necessary here)

-- Set up three users
INSERT INTO users (first_name, last_name, email, password) VALUES ('Simon', 'Star', 'simon@gmail.com', 'password1');
INSERT INTO users (first_name, last_name, email, password) VALUES ('Dianne', 'Dean', 'dianne@yahoo.co.uk', 'password2');
INSERT INTO users (first_name, last_name, email, password) VALUES ('Harry', 'Hilbert', 'harry@hotmail.com', 'password3');

-- Give Simon two email addresses and Diane one, but Harry has none
INSERT INTO email_accounts (email_address, user_id) VALUES ('simon@gmail.com', 1); 
INSERT INTO email_accounts (email_address, user_id) VALUES ('simon@hotmail.com', 1); 
INSERT INTO email_accounts (email_address, user_id) VALUES ('dianne@yahoo.co.uk', 2); 

COMMIT;
