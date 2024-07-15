const helpers = require('../utils/helpers');
const dbUtils = require('../utils/dbUtils');
const asyncHandler = require('../utils/asyncHandler');

const articleController = {
  // Function to get and display articles
  getArticles: asyncHandler(async (req, res) => {
    // Retrieve published articles sorted by creation date descending
    const articles = await dbUtils.all("SELECT * FROM articles WHERE status = 'pub' ORDER BY created DESC;");

    // Enhance articles with user details and comment count asynchronously
    const articlesWithDetails = await Promise.all(articles.map(async (article) => {
      const userQuery = `SELECT blog, first_name, last_name FROM users WHERE user_id = ?;`;
      const commentQuery = `SELECT COUNT(*) as commentCount FROM comments WHERE article_id = ?;`;
  
      const [user, comment] = await Promise.all([
        dbUtils.get(userQuery, [article.user_id]),
        dbUtils.get(commentQuery, [article.article_id])
      ]);
  
      // Return article with added user details and comment count
      return {
        ...article,
        name: { blog: user.blog, first: user.first_name, last: user.last_name },
        commentCount: comment.commentCount
      };
    }));
  
    // Render view with articles and time ago helper function
    res.render(res.locals.layout, {
      title: 'Small Blog',
      content: 'articles',
      articles: articlesWithDetails,
      timeAgo: helpers.timeAgo  // Helper function for displaying time ago
    });
  }),

  // Function to get and display a single article
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

    // Update article views count in the database
    await dbUtils.run(updateViewsQuery, [articleId]);

    // Retrieve the article details
    const article = await dbUtils.get(articleQuery, [articleId]);

    // Throw error if article not found
    if (!article) {
      throw new Error('The article was not found');
    }

    // Retrieve comments associated with the article
    const comments = await dbUtils.all(commentsQuery, [articleId]);

     // Render view with article details, comments, and time ago helper function
    res.render(res.locals.layout, {
      title: article.title,
      content: 'view-article',
      article,
      comments,
      timeAgo: helpers.timeAgo  // Helper function for displaying time ago
    });
  }),

  // Function to increment 'likes' count for an article
  likeArticle: asyncHandler(async (req, res) => {
    const articleId = req.params.id;

    // Throw error if article ID is missing
    if (!articleId) {
      throw new Error('Article ID is required');
    }
    
    const query = "UPDATE articles SET likes = likes + 1 WHERE article_id = ?;";
    
    // Update 'likes' count for the article in the database
    const result = await dbUtils.run(query, [articleId]);

    // Throw error if no rows were affected (article not found)
    if (result.changes === 0) {
      throw new Error('Article not found');
    }

    // Redirect to the article view page after successfully updating 'likes'
    res.redirect(`/reader/${articleId}`);
  })
};

module.exports = articleController;