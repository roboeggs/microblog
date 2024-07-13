// routes/articles.js

const express = require('express');
const router = express.Router();

// Handle requests to the home page
router.get('/', (req, res) => {
    const query = "SELECT * FROM articles;";

    global.db.all(query, function (err, articles) {
        if (err) {
            console.error(err.message);
            res.status(400).send({ error: err.message });
            return;
        }

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

router.get('/article/:id', (req, res) => {
    const articleId = req.params.id;
    const articleQuery = `SELECT * FROM articles WHERE article_id = ?;`;
    const commentsQuery = `
        SELECT comments.comment, comments.comment_id, users.first_name, users.last_name 
        FROM comments 
        JOIN users ON comments.user_id = users.user_id 
        WHERE comments.article_id = ?;
    `;

    global.db.get(articleQuery, [articleId], (err, article) => {
        if (err) {
            console.error(err.message);
            res.status(400).send({ error: err.message });
            return;
        }

        if (!article) {
            res.status(404).send({ error: 'Статья не найдена' });
            return;
        }

        global.db.all(commentsQuery, [articleId], (err, comments) => {
            if (err) {
                console.error(err.message);
                res.status(400).send({ error: err.message });
                return;
            }

            res.render(res.locals.layout, { content: 'view-article', article, comments });
        });
    });
});


module.exports = router;
