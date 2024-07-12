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
const app = express();

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

router.get("/home-page", (req, res) => {
    res.render(res.locals.layout, { content: 'home-page' });
    // res.render("home-page.ejs")
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
                const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '4h' });

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
