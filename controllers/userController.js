const jwt = require('jsonwebtoken');
const helpers = require('../utils/helpers');
const SECRET_KEY = 'small-blog-key';

const listUsers = (req, res, next) => {
    const query = "SELECT * FROM users";
    global.db.all(query, function (err, rows) {
        if (err) {
            next(err);
        } else {
            res.json(rows);
        }
    });
};

const addUserPage = (req, res) => {
    res.render(res.locals.layout, { title : 'Add user', content: 'add-user' });
};

const createArticlePage = (req, res) => {
    const articleId = req.params.articleId;
    if (articleId) {
        const query = "SELECT * FROM articles WHERE article_id = ?;";
        const query_parameters = [articleId];
        global.db.get(query, query_parameters, function (err, article) {
            if (err) {
                res.status(400).send({ error: err.message });
                return;
            }
            res.render(res.locals.layout, { title : 'Create article', content: 'create', article });
        });
    } else {
        res.render(res.locals.layout, { title : 'Create article', content: 'create', article: false });
    }
};

const createArticle = (req, res) => {
    const user = req.user;
    const { title, body: content } = req.body;
    const status = "draft";

    const query = `
        INSERT INTO articles (user_id, title, content, status, created, last_change)
        VALUES (?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'));
    `;
    const query_parameters = [user.id, title, content, status];

    global.db.run(query, query_parameters, function (err) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }
        const articleId = this.lastID; // Получаем ID вставленной статьи
        console.log(articleId)
        res.redirect(`/users/create/${articleId}`);
    });
};




const updateArticle = (req, res) => {
    const user = req.user;
    const articleId = req.params.articleId;
    const { title, body: content } = req.body;

    const query = `
        UPDATE articles
        SET title = ?,
            content = ?,
            last_change = datetime('now', 'localtime')
        WHERE user_id = ? AND article_id = ?;
    `;
    const query_parameters = [title, content, user.id, articleId];

    global.db.run(query, query_parameters, function (err) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }
        res.redirect(`/users/create/${articleId}`);
    });
};




const articleAction = (req, res) => {
    const user = req.user;
    const { action } = req.body;
    const articles = Object.keys(req.body)
        .filter(key => key !== 'action')
        .map(key => Number(key));

    if (articles.some(isNaN)) {
        res.status(400).send({ error: 'Invalid article ID' });
        return;
    }

    let query, queryParameters;
    const currentTime = new Date().toISOString(); // Текущая дата и время в формате ISO

    switch (action) {
        case 'pub':
            query = `UPDATE articles SET status = 'pub', published = datetime('now', 'localtime') 
            WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`;
            queryParameters = [...articles, user.id];
            break;
        case 'del':
            query = `DELETE FROM articles WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`;
            queryParameters = [...articles, user.id];
            break;
        case 'take_off':
            query = `UPDATE articles SET status = 'draft', removed_from_publication_views = datetime('now', 'localtime') 
            WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`;
            queryParameters = [...articles, user.id];
            break;
        default:
            res.status(400).send({ error: 'Unknown action' });
            return;
    }

    global.db.run(query, queryParameters, function (err) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }
        res.redirect('/users/home-page');
    });
};



const homePage = (req, res) => {
    const user = req.user;
    const userQuery = "SELECT * FROM users WHERE user_id = ?;";
    const articlesQuery = "SELECT * FROM articles WHERE user_id = ?;";
    const query_parameters = [user.id];

    global.db.get(userQuery, query_parameters, function (err, userInfo) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }

        global.db.all(articlesQuery, query_parameters, function (err, articles) {
            if (err) {
                res.status(400).send({ error: err.message });
                return;
            }

            res.render(res.locals.layout, {
                title: 'Home page',
                content: 'home-page',
                user: userInfo,
                articles
            });
        });
    });
};

const addComment = (req, res) => {
    const user = req.user;
    const { comment } = req.body;
    const article_id = req.params.article_id;

    // Проверка на пустую строку
    if (!comment || comment.trim() === "") {
        res.redirect(`/article/${article_id}`);
        return;
    }

    const query = "INSERT INTO comments (user_id, article_id, comment) VALUES (?, ?, ?);";
    global.db.run(query, [user.id, article_id, comment], function (err) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }
        res.redirect(`/article/${article_id}`);
    });
};

const loginPage = (req, res) => {
    res.render(res.locals.layout, {  title : 'Log in to your account', content: 'login' });
};

const login = (req, res) => {
    const { email, psw } = req.body;
    const query = "SELECT * FROM users WHERE email = ?;";
    const query_parameters = [email];
    global.db.get(query, query_parameters, function (err, user) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }
        if (user && psw === user.password) {
            const token = jwt.sign({ id: user.user_id }, SECRET_KEY, { expiresIn: '4h' });
            res.cookie('token', token, { httpOnly: true });
            res.redirect('/users/home-page');
        } else {
            res.status(400).send({ error: user ? "Invalid password" : "User not found" });
        }
    });
};

const logout = (req, res) => {
    res.clearCookie('token'); // Удаляем cookie с именем 'token'
    res.redirect('/'); // Перенаправляем пользователя на главную страницу или другую страницу
};

const addUser = (req, res) => {
    const { first_name, last_name, email, psw, psw_repeat } = req.body;
    if (psw !== psw_repeat) {
        res.status(400).send({ error: "Passwords do not match" });
        return;
    }
    const query = "INSERT INTO users (first_name, last_name, email, password) VALUES(?, ?, ?, ?);";
    const query_parameters = [first_name, last_name, email, psw];
    global.db.run(query, query_parameters, function (err) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }
        const user_id = this.lastID; // Получаем ID вставленной записи
        const token = jwt.sign({ id: user_id }, SECRET_KEY, { expiresIn: '4h' });
        res.cookie('token', token, { httpOnly: true });
        res.redirect('/users/home-page');
    });
};


const profileSettingsPage = (req, res) => {
    const userId = req.user.id; // Предполагаем, что id пользователя доступен в req.user

    // Запрос к базе данных для получения имени и фамилии пользователя
    const query = `
        SELECT blog, first_name, last_name 
        FROM users 
        WHERE user_id = ?;
    `;

    global.db.get(query, [userId], (err, user) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ error: err.message });
            return;
        }

        if (!user) {
            res.status(404).send({ error: 'Пользователь не найден' });
            return;
        }


        // Рендерим страницу настроек профиля и передаем данные пользователя в шаблон
        res.render(res.locals.layout, {  title : 'Setting', content: 'profile-settings', user });
    });
};


const updateProfile = (req, res) => {
    const user_id = req.user.id; // Получаем ID пользователя из объекта запроса (предположим, что он доступен через req.user)
    const { blog, first_name, last_name, psw, psw_repeat } = req.body; // Извлекаем данные из тела запроса

    console.log(req.body);
    console.log(blog, first_name, last_name, psw, psw_repeat)

    let updateUserQuery = '';
    let params = [];

    if (psw) {
        params = [psw, user_id];
        console.log('это пароль');
        if (psw === psw_repeat) {
            // Если psw и psw_repeat одинаковы, обновляем пароль
            updateUserQuery = `
                UPDATE users
                SET password = ?
                WHERE user_id = ?;
            `;
            params = [psw, user_id];
        } else {
            // Если psw и psw_repeat не одинаковы, отправляем сообщение об ошибке
            res.status(400).send({ error: "passwords don't match" });
            return;
        }
    } else {
        // Если newPassword пустой, значит пользователь хочет изменить только данные профиля
        updateUserQuery = `
            UPDATE users
            SET 
                blog = ?,
                first_name = ?,
                last_name = ?
            WHERE user_id = ?;
        `;
        params = [blog, first_name, last_name, user_id];
    }
    
    global.db.run(updateUserQuery, params, function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send({ error: err.message }); // Отправляем статус ошибки и сообщение об ошибке
        } else {
            // В случае успешного обновления, редиректим пользователя на страницу профиля или другую подходящую страницу
            res.redirect('/users/settings');
        }
    });
};



module.exports = {
    listUsers,
    addUserPage,
    createArticlePage,
    createArticle,
    updateArticle,
    articleAction,
    homePage,
    addComment,
    loginPage,
    login,
    logout,
    addUser,
    profileSettingsPage,
    updateProfile
};
