// routes/articles.js

const express = require('express');
const helpers = require('../utils/helpers');
const router = express.Router();

// Handle requests to the home page
router.get('/', (req, res) => {
    const query = "SELECT * FROM articles WHERE status = 'pub';";

    global.db.all(query, function (err, articles) {
        if (err) {
            console.error(err.message);
            res.status(400).send({ error: err.message });
            return;
        }

        const promises = articles.map(article => {
            return new Promise((resolve, reject) => {
                const userQuery = `SELECT blog, first_name, last_name FROM users WHERE user_id = ${article.user_id};`;
                const commentQuery = `SELECT COUNT(*) as commentCount FROM comments WHERE article_id = ${article.article_id};`;

                global.db.get(userQuery, (err, user) => {
                    if (err) {
                        console.error(err.message);
                        reject(err);
                        return;
                    }

                    article.name = { blog: user.blog, first: user.first_name, last: user.last_name};

                    global.db.get(commentQuery, (err, comment) => {
                        if (err) {
                            console.error(err.message);
                            reject(err);
                            return;
                        }

                        article.commentCount = comment.commentCount;
                        console.log(article)
                        resolve();
                    });
                });
            });
        });

        Promise.all(promises)
            .then(() => {
                res.render(res.locals.layout, {  title : 'Small Blog', content: 'articles', articles, timeAgo: helpers.timeAgo });
            })
            .catch(err => {
                console.error(err.message);
                res.status(500).send({ error: err.message });
            });
    });
});

router.get('/article/:id', (req, res) => {
    const articleId = req.params.id;
    const articleQuery = `SELECT * FROM articles WHERE article_id = ?;`;
    const commentsQuery = `
        SELECT comments.comment, comments.comment_id, comments.created, users.first_name, users.last_name 
        FROM comments 
        JOIN users ON comments.user_id = users.user_id 
        WHERE comments.article_id = ?;
    `;
    const updateViewsQuery = `UPDATE articles SET views = views + 1 WHERE article_id = ?;`;

    global.db.run(updateViewsQuery, [articleId], function (err) {
        if (err) {
            console.error(err.message);
            res.status(400).send({ error: err.message });
            return;
        }

        global.db.get(articleQuery, [articleId], (err, article) => {
            if (err) {
                console.error(err.message);
                res.status(400).send({ error: err.message });
                return;
            }

            if (!article) {
                res.status(404).send({ error: 'The article was not found' });
                return;
            }

            global.db.all(commentsQuery, [articleId], (err, comments) => {
                if (err) {
                    console.error(err.message);
                    res.status(400).send({ error: err.message });
                    return;
                }
                
                res.render(res.locals.layout, { 
                    title: article.title, 
                    content: 'view-article', 
                    article, 
                    comments, timeAgo: helpers.timeAgo 
                });
            });
        });
    });
});

router.get('/article/like/:articleId',  (req, res) => {
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
        res.redirect(`/article/${articleId}`);
    });
});


module.exports = router;