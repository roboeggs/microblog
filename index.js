/**
* index.js
* This is your main app entry point
*/

// Set up express, bodyparser and EJS
const express = require('express');
const app = express();
const port = 3000;
var bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
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

app.use(cookieParser());

// Handle requests to the home page
/*
app.get('/', (req, res) => {
    // Определение запроса
    const query = "SELECT * FROM articles;";

    // Выполнение запроса
    global.db.all(query, function (err, articles) {
        if (err) {
            console.error(err.message); // Запись сообщения об ошибке в консоль сервера
            res.status(400).send({ error: err.message }); // Отправка сообщения об ошибке в ответе сервера
            return;
        }

        // Если все прошло хорошо, отправляем данные статей
        console.log(articles);
        res.render(res.locals.layout, { content: 'articles', articles });
    });
});
*/

app.get('/', (req, res) => {
    // Определение запроса
    const query = "SELECT * FROM articles;";

    // Выполнение запроса
    global.db.all(query, function (err, articles) {
        if (err) {
            console.error(err.message); // Запись сообщения об ошибке в консоль сервера
            res.status(400).send({ error: err.message }); // Отправка сообщения об ошибке в ответе сервера
            return;
        }

        // Если все прошло хорошо, отправляем данные статей
        console.log(articles);

        // Для каждой статьи получаем информацию о создателе и количество комментариев
        const promises = articles.map(article => {
            return new Promise((resolve, reject) => {
                const userQuery = `SELECT first_name, last_name FROM users WHERE user_id = ${article.user_id};`;
                const commentQuery = `SELECT COUNT(*) as commentCount FROM comments WHERE article_id = ${article.article_id};`;

                global.db.get(userQuery, (err, user) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                        return;
                    }

                    article.name = { first: user.first_name, last: user.last_name };

                    global.db.get(commentQuery, (err, comment) => {
                        if (err) {
                            console.error(err.message);
                            reject(err);
                            return;
                        }

                        article.commentCount = comment.commentCount;

                        console.log(article);
                        resolve();
                    });
                });
            });
        });

        Promise.all(promises)
            .then(() => {
                res.render(res.locals.layout, { content: 'articles', articles });
            })
            .catch(err => {
                console.error(err.message);
                res.status(500).send({ error: err.message });
            });
    });
});


// Маршрут для просмотра отдельной статьи
app.get('/article/:id', (req, res) => {
    // Получение id статьи из параметров маршрута
    const articleId = req.params.id;

    // Запрос к базе данных для получения статьи
    const query = `SELECT * FROM articles WHERE article_id = ${articleId};`;

    global.db.get(query, (err, article) => {
        if (err) {
            console.error(err.message);
            res.status(400).send({ error: err.message });
            return;
        }

        // Если статья найдена, рендерим шаблон с данными статьи
        console.log(article);
        if (article) {
            res.render(res.locals.layout, { content: 'viewi_article', article });
        } else {
            res.status(404).send({ error: 'Статья не найдена' });
        }
    });
});


// Add all the route handlers in usersRoutes to the app under the path /users
const usersRoutes = require('./routes/users');
app.use('/users', usersRoutes);


// Make the web application listen for HTTP requests
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
