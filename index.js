/**
* index.js
* This is your main app entry point
*/

// Set up express, bodyparser and EJS
const express = require('express');
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
const cookieParser = require('cookie-parser'); // Middleware to parse cookies attached to the client request object
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.set('views', __dirname + '/views'); // set the location of the views directory
app.use(express.static(__dirname + '/public')); // set location of static files

// Set up SQLite
const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database('./database.db', function(err) {
    if (err) {
        console.error(err);
        process.exit(1); // bail out we can't connect to the DB
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); // tell SQLite to pay attention to foreign key constraints
    }
});

// Middleware to set default layout
app.use((req, res, next) => {
    res.locals.layout = 'layout'; // set the default layout for all views
    next();
});

app.use(cookieParser()); // Using cookieParser to parse cookies

// Importing route handlers
const usersRoutes = require('./routes/user');   // Importing routes for users
app.use('/users', usersRoutes); // Using user routes for paths starting with /users

const authorRoutes = require('./routes/author');    // Importing routes for authors
app.use('/author', authorRoutes);    // Using author routes for paths starting with /author

const readerRoutes = require('./routes/articles');// Importing routes for readers
app.use('/reader', readerRoutes) // Using reader routes for paths starting with /reader


app.get('/', (req, res) => {
    res.render(res.locals.layout, { // Rendering the default layout
        title: 'Main Home Page',   // Setting the title of the page
        content: 'main-page',   // Setting the content of the page
    });
});


// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
