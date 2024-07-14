const helpers = require('../utils/helpers');
const dbUtils = require('../utils/dbUtils');
const asyncHandler = require('../utils/asyncHandler');

const articleController = {
  /** 
  getArticles: asyncHandler(async (req, res) => {
    const articles = await dbUtils.all("SELECT * FROM articles WHERE status = 'pub';");

    const articlesWithDetails = await Promise.all(articles.map(async (article) => {
      const userQuery = `SELECT blog, first_name, last_name FROM users WHERE user_id = ?;`;
      const commentQuery = `SELECT COUNT(*) as commentCount FROM comments WHERE article_id = ?;`;

      const [user, comment] = await Promise.all([
        dbUtils.get(userQuery, [article.user_id]),
        dbUtils.get(commentQuery, [article.article_id])
      ]);

      return {
        ...article,
        name: { blog: user.blog, first: user.first_name, last: user.last_name },
        commentCount: comment.commentCount
      };
    }));

    res.render(res.locals.layout, {
      title: 'Small Blog',
      content: 'articles',
      articles: articlesWithDetails,
      timeAgo: helpers.timeAgo
    });
  }),
  */

  getArticles: asyncHandler(async (req, res) => {
    // Изменяем SQL-запрос, добавляя сортировку по дате создания (предполагая, что у вас есть поле created_at)
    const articles = await dbUtils.all("SELECT * FROM articles WHERE status = 'pub' ORDER BY created DESC;");
  
    const articlesWithDetails = await Promise.all(articles.map(async (article) => {
      const userQuery = `SELECT blog, first_name, last_name FROM users WHERE user_id = ?;`;
      const commentQuery = `SELECT COUNT(*) as commentCount FROM comments WHERE article_id = ?;`;
  
      const [user, comment] = await Promise.all([
        dbUtils.get(userQuery, [article.user_id]),
        dbUtils.get(commentQuery, [article.article_id])
      ]);
  
      return {
        ...article,
        name: { blog: user.blog, first: user.first_name, last: user.last_name },
        commentCount: comment.commentCount
      };
    }));
  
    res.render(res.locals.layout, {
      title: 'Small Blog',
      content: 'articles',
      articles: articlesWithDetails,
      timeAgo: helpers.timeAgo
    });
  }),

  getArticle: asyncHandler(async (req, res) => {
    const articleId = req.params.id;
    const articleQuery = `SELECT * FROM articles WHERE article_id = ?;`;
    const commentsQuery = `
      SELECT comments.comment, comments.comment_id, comments.created, users.first_name, users.last_name 
      FROM comments 
      JOIN users ON comments.user_id = users.user_id 
      WHERE comments.article_id = ?
      ORDER BY comments.created DESC;
    `;
    const updateViewsQuery = `UPDATE articles SET views = views + 1 WHERE article_id = ?;`;

    await dbUtils.run(updateViewsQuery, [articleId]);

    const article = await dbUtils.get(articleQuery, [articleId]);

    if (!article) {
      throw new Error('The article was not found');
    }

    const comments = await dbUtils.all(commentsQuery, [articleId]);

    res.render(res.locals.layout, {
      title: article.title,
      content: 'view-article',
      article,
      comments,
      timeAgo: helpers.timeAgo
    });
  }),

  likeArticle: asyncHandler(async (req, res) => {
    const articleId = req.params.id;

    if (!articleId) {
      throw new Error('Article ID is required');
    }

    const query = "UPDATE articles SET likes = likes + 1 WHERE article_id = ?;";
    const result = await dbUtils.run(query, [articleId]);

    if (result.changes === 0) {
      throw new Error('Article not found');
    }

    res.redirect(`/reader/${articleId}`);
  })
};

module.exports = articleController;