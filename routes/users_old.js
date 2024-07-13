/**
 * users.js
 * These are example routes for user management
 * This shows how to correctly structure your routes for the project
 * and the suggested pattern for retrieving data by executing queries
 *
 * NB. it's better NOT to use arrow functions for callbacks with the SQLite library
* 
 */
 
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');


// Секретный ключ для подписи JWT
const SECRET_KEY = 'small-blog-key';

/**
 * @desc Display all the users
 */
router.get("/list-users", (req, res, next) => {
    // Define the query
    query = "SELECT * FROM users"

    // Execute the query and render the page with the results
    global.db.all(query, 
        function (err, rows) {
            if (err) {
                next(err); //send the error on to the error handler
            } else {
                res.json(rows); // render page as simple json
            }
        }
    );
});

/**
 * @desc Displays a page with a form for creating a user record
 */
router.get("/add-user", (req, res) => {
    
    res.render(res.locals.layout, { content: 'add-user' });
});

router.get("/create/:articleId?", (req, res) => {
    const articleId = req.params.articleId;

    if (articleId) {
        // Если передан articleId, получаем данные статьи из базы данных
        const query = "SELECT * FROM articles WHERE article_id = ?;";
        const query_parameters = [articleId];

        global.db.get(query, query_parameters, function (err, article) {
            if (err) {
                console.error(err.message); // Запись сообщения об ошибке в консоль сервера
                res.status(400).send({ error: err.message }); // Отправка сообщения об ошибке в ответе сервера
                return;
            }

            // Если все прошло хорошо, отправляем данные статьи
            res.render(res.locals.layout, { content: 'create', article });
        });
    } else {
        // Если articleId не передан, просто отображаем страницу
        res.render(res.locals.layout, { content: 'create', article: false });
    }
});

router.post("/create", (req, res) => {
    // Получение JWT из куки
    const token = req.cookies.token;

    // Проверка JWT
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            // Если произошла ошибка при проверке, отправляем статус 403
            return res.sendStatus(403);
        }

         // Получение данных статьи из формы
         const title = req.body.title;
         const content = req.body.body;
         const status = "draft"; // или любой другой статус по умолчанию

         // Определение запроса на добавление статьи
         const query = "INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?);";
         const query_parameters = [user.id, title, content, status];
        
         // Выполнение запроса и отправка сообщения о подтверждении
         global.db.run(query, query_parameters, function (err) {
             if (err) {
                 console.error(err.message); // Запись сообщения об ошибке в консоль сервера
                 res.status(400).send({ error: err.message }); // Отправка сообщения об ошибке в ответе сервера
                 return;
             }
 
             // Если все прошло хорошо, перенаправляем пользователя на главную страницу
             res.redirect('/users/home-page');
         });
     });
 });

 router.post("/action", (req, res) => {
    // Получение JWT из куки
    const token = req.cookies.token;

    // Проверка JWT
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            // Если произошла ошибка при проверке, отправляем статус 403
            return res.sendStatus(403);
        }

        // Получение данных из запроса
        const action = req.body.action;

        // Сбор идентификаторов статей
        const articles = Object.keys(req.body).filter(key => key !== 'action');
        console.log(action, articles);
        // Обработка действия в зависимости от выбранного значения
        switch (action) {
            case 'pub':
                // Обработка публикации статей
                const queryPub = "UPDATE articles SET status = 'pub' WHERE article_id IN (?) AND user_id = ?;";
                const queryParametersPub = [articles.join(','), user.id];
                global.db.run(queryPub, queryParametersPub, function (err) {
                    if (err) {
                        console.error(err.message); // Запись сообщения об ошибке в консоль сервера
                        res.status(400).send({ error: err.message }); // Отправка сообщения об ошибке в ответе сервера
                        return;
                    }
                    res.redirect('/users/home-page');
                });
                break;
            case 'del':
                // Обработка удаления статей
                const queryDel = "DELETE FROM articles WHERE article_id IN (?) AND user_id = ?;";
                const queryParametersDel = [articles.join(','), user.id];
                global.db.run(queryDel, queryParametersDel, function (err) {
                    if (err) {
                        console.error(err.message); // Запись сообщения об ошибке в консоль сервера
                        res.status(400).send({ error: err.message }); // Отправка сообщения об ошибке в ответе сервера
                        return;
                    }
                    res.redirect('/users/home-page');
                });
                break;
            case 'take_off':
                // Обработка снятия статей с публикации
                const queryTakeOff = "UPDATE articles SET status = 'pub' WHERE article_id IN (?) AND user_id = ?;";
                const queryParametersTakeOff = [articles.join(','), user.id];
                global.db.run(queryTakeOff, queryParametersTakeOff, function (err) {
                    if (err) {
                        console.error(err.message); // Запись сообщения об ошибке в консоль сервера
                        res.status(400).send({ error: err.message }); // Отправка сообщения об ошибке в ответе сервера
                        return;
                    }
                    res.redirect('/users/home-page');
                });
                break;
            default:
                // Неизвестное действие
                res.status(400).send({ error: 'Unknown action' });
        }
    });
});



router.get("/home-page", (req, res) => {
    // Получение JWT из куки
    const token = req.cookies.token;

    // Проверка JWT
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            // Если произошла ошибка при проверке, отправляем статус 403
            return res.sendStatus(403);
        }

        // Определение запроса
        const query = "SELECT * FROM articles WHERE user_id = ?;";
        const query_parameters = [user.id];

        // Выполнение запроса и отправка сообщения о подтверждении
        global.db.all(query, query_parameters, function (err, articles) {
            if (err) {
                console.error(err.message); // Запись сообщения об ошибке в консоль сервера
                res.status(400).send({ error: err.message }); // Отправка сообщения об ошибке в ответе сервера
                return;
            }
            console.log(query_parameters);
            // Если все прошло хорошо, отправляем данные пользователя и статьи
            res.render(res.locals.layout, { content: 'home-page', user, articles });
        });
    });
});

// Маршрут для добавления комментария
router.post("/users/comment/:article_id", (req, res) => {
    // Получение JWT из куки
    const token = req.cookies.token;

    // Проверка JWT
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            // Если произошла ошибка при проверке, перенаправляем на страницу входа
            return res.redirect('/login');
        }

        // Получение комментария из формы
        const comment = req.body.comment;

        // Получение идентификатора статьи из параметров маршрута
        const article_id = req.params.article_id;

        // Запрос к базе данных для создания нового комментария
        const query = `INSERT INTO comments (user_id, article_id, comment) VALUES (?, ?, ?);`;

        global.db.run(query, [user.id, article_id, comment], function(err) {
            if (err) {
                console.error(err.message);
                res.status(400).send({ error: err.message });
                return;
            }

            // Перенаправление обратно на страницу статьи
            res.redirect(`/article/${article_id}`);
        });
    });
});


router.get("/login", (req, res) => {
    res.render(res.locals.layout, { content: 'login' });
});

router.post("/login", (req, res, next) => {
    // Get the form data
    const { email, psw } = req.body;

    // Define the query
    const query = "SELECT * FROM users WHERE email = ?;";
    const query_parameters = [email];
    
    // Выполнение запроса и отправка сообщения о подтверждении
    global.db.get(query, query_parameters, function (err, user) {
        if (err) {
            console.error(err.message); // Запись сообщения об ошибке в консоль сервера
            res.status(400).send({ error: err.message }); // Отправка сообщения об ошибке в ответе сервера
            return;
        }

        if (user) {
            // Проверка пароля
            if (psw === user.password) {
                // Если все прошло хорошо, генерация JWT для пользователя
                console.log(user.user_id);
                const token = jwt.sign({ id: user.user_id }, SECRET_KEY, { expiresIn: '4h' });

                // Установка JWT в куки
                res.cookie('token', token, { httpOnly: true });

                // Отправка ответа клиенту
                // res.json({ message: 'Login successful' });
                res.redirect('/users/home-page');
            } else {
                res.status(400).send({ error: "Invalid password" });
            }
        } else {
            res.status(400).send({ error: "User not found" });
        }
    });

});


/**
 * @desc Add a new user to the database based on data from the submitted form
 */
router.post("/add-user", (req, res, next) => {
    // Get the form data
    const { first_name, last_name, email, psw, psw_repeat } = req.body;

    // Check if passwords match
    if (psw !== psw_repeat) {
        res.status(400).send({ error: "Passwords do not match" });
        return;
    }

    // Define the query
    const query = "INSERT INTO users (first_name, last_name, email, password) VALUES(?, ?, ?, ?);"
    const query_parameters = [first_name, last_name, email, psw]
    
    // Execute the query and send a confirmation message
    global.db.run(query, query_parameters,
        function (err) {
            if (err) {
                console.error(err.message); // Log error message in your server's console
                res.status(400).send({ error: err.message }); // Send error message as a response from the server
                return;
            }
             // If everything went well, redirect the user to another page
            res.redirect('/users/list-users');
        }
    );
});


// Export the router object so index.js can access it
module.exports = router;
