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
    const currentTime = new Date().toISOString(); // Текущая дата и время в формате ISO

    const query = `
        INSERT INTO articles (user_id, title, content, status, created, last_change)
        VALUES (?, ?, ?, ?, ?, ?);
    `;
    const query_parameters = [user.id, title, content, status, currentTime, currentTime];

    global.db.run(query, query_parameters, function (err) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }
        res.redirect('/users/home-page');
    });
};




const updateArticle = (req, res) => {
    const user = req.user;
    const articleId = req.params.articleId;
    const { title, body: content } = req.body;

    // Получаем текущее время
    const currentTime = new Date().toISOString();

    const query = `
        UPDATE articles
        SET title = ?,
            content = ?,
            last_change = ?
        WHERE user_id = ? AND article_id = ?;
    `;
    const query_parameters = [title, content, currentTime, user.id, articleId];

    global.db.run(query, query_parameters, function (err) {
        if (err) {
            res.status(400).send({ error: err.message });
            return;
        }
        res.redirect('/users/home-page');
    });
};




/** 
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
    switch (action) {
        case 'pub':
            query = `UPDATE articles SET status = 'pub' WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`;
            queryParameters = [...articles, user.id];
            break;
        case 'del':
            query = `DELETE FROM articles WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`;
            queryParameters = [...articles, user.id];
            break;
        case 'take_off':
            query = `UPDATE articles SET status = 'draft' WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`;
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

*/

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
            query = `UPDATE articles SET status = 'pub', published = ? WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`;
            queryParameters = [currentTime, ...articles, user.id];
            break;
        case 'del':
            query = `DELETE FROM articles WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`;
            queryParameters = [...articles, user.id];
            break;
        case 'take_off':
            query = `UPDATE articles SET status = 'draft', removed_from_publication_views = ? WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`;
            queryParameters = [currentTime, ...articles, user.id];
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

const likeArticle = (req, res) => {
    const articleId = req.params.articleId;

    // Проверка наличия articleId
    if (!articleId) {
        return res.status(400).send('Article ID is required');
    }

    // Увеличиваем количество лайков в базе данных
    const query = "UPDATE articles SET likes = likes + 1 WHERE article_id = ?;";
    const queryParameters = [articleId];

    global.db.run(query, queryParameters, function(err) {
        if (err) {
            console.error('Error in likeArticle:', err);
            res.status(500).send({ error: 'Internal Server Error' });
            return;
        }

        // Проверяем, была ли обновлена какая-либо запись
        if (this.changes === 0) {
            return res.status(404).send('Article not found');
        }

        // Возвращаемся на страницу с деталями статьи после лайка
        res.redirect(`/articles/${articleId}`);
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


const profileSettingsPage = (req, res) => {
    const userId = req.user.id; // Предполагаем, что id пользователя доступен в req.user

    // Запрос к базе данных для получения имени и фамилии пользователя
    const query = `
        SELECT first_name, last_name 
        FROM users 
        WHERE user_id = ?;
    `;

    global.db.get(query, [userId], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ error: err.message });
            return;
        }

        if (!row) {
            res.status(404).send({ error: 'Пользователь не найден' });
            return;
        }

        const user = {
            firstName: row.first_name,
            lastName: row.last_name
        };

        // Рендерим страницу настроек профиля и передаем данные пользователя в шаблон
        res.render(res.locals.layout, { content: 'profile-settings', user });
    });
};


const updateProfile = (req, res) => {
    const user_id = req.user.id; // Получаем ID пользователя из объекта запроса (предположим, что он доступен через req.user)
    const { first_name, last_name, psw, psw_repeat } = req.body; // Извлекаем данные из тела запроса

    console.log(req.body);
    console.log(first_name, last_name, psw, psw_repeat)

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
            SET first_name = ?,
                last_name = ?
            WHERE user_id = ?;
        `;
        params = [first_name, last_name, user_id];
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
    addUser,
    profileSettingsPage,
    updateProfile,
    likeArticle
};
