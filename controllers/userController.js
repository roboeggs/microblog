const jwt = require('jsonwebtoken');
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
    res.render(res.locals.layout, { content: 'add-user' });
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
            res.render(res.locals.layout, { content: 'create', article });
        });
    } else {
        res.render(res.locals.layout, { content: 'create', article: false });
    }
};

const createArticle = (req, res) => {
    const user = req.user;
    const { title, body: content } = req.body;
    const status = "draft";
    const query = "INSERT INTO articles (user_id, title, content, status) VALUES (?, ?, ?, ?);";
    const query_parameters = [user.id, title, content, status];
    global.db.run(query, query_parameters, function (err) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }
        res.redirect('/users/home-page');
    });
};

const articleAction = (req, res) => {
    const user = req.user;
    const { action } = req.body;
    const articles = Object.keys(req.body).filter(key => key !== 'action');
    let query, queryParameters;
    switch (action) {
        case 'pub':
            query = "UPDATE articles SET status = 'pub' WHERE article_id IN (?) AND user_id = ?;";
            queryParameters = [articles.join(','), user.id];
            break;
        case 'del':
            query = "DELETE FROM articles WHERE article_id IN (?) AND user_id = ?;";
            queryParameters = [articles.join(','), user.id];
            break;
        case 'take_off':
            query = "UPDATE articles SET status = 'draft' WHERE article_id IN (?) AND user_id = ?;";
            queryParameters = [articles.join(','), user.id];
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
    const query = "SELECT * FROM articles WHERE user_id = ?;";
    const query_parameters = [user.id];
    global.db.all(query, query_parameters, function (err, articles) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }
        res.render(res.locals.layout, { content: 'home-page', user, articles });
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
    res.render(res.locals.layout, { content: 'login' });
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
        res.redirect('/users/list-users');
    });
};

module.exports = {
    listUsers,
    addUserPage,
    createArticlePage,
    createArticle,
    articleAction,
    homePage,
    addComment,
    loginPage,
    login,
    addUser
};
