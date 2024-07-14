const jwt = require('jsonwebtoken');
const dbUtils = require('../utils/dbUtils');
const asyncHandler = require('../utils/asyncHandler');
const SECRET_KEY = 'small-blog-key';


// Валидация пользовательских данных
const validateUser = (userData) => {
  const { first_name, last_name, email, psw, psw_repeat } = userData;
  if (!first_name || !last_name || !email || !psw || !psw_repeat) {
    throw new Error("All fields are required");
  }
  if (psw !== psw_repeat) {
    throw new Error("Passwords do not match");
  }
  // Добавьте дополнительные проверки по необходимости
};


const addUserPage = (req, res) => {
  res.render(res.locals.layout, { title: 'Add user', content: 'add-user' });
};

const createArticlePage = asyncHandler(async (req, res) => {
  const articleId = req.params.articleId;
  let article = false;
  if (articleId) {
    article = await dbUtils.get("SELECT * FROM articles WHERE article_id = ?;", [articleId]);
  }
  res.render(res.locals.layout, { title: 'Create article', content: 'create', article });
});

const createArticle = asyncHandler(async (req, res) => {
  const user = req.user;
  const { title, body: content } = req.body;
  const status = "draft";

  const query = `
    INSERT INTO articles (user_id, title, content, status, created, last_change)
    VALUES (?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'));
  `;
  const result = await dbUtils.run(query, [user.id, title, content, status]);
  res.redirect(`/author/create/${result.lastID}`);
});

const updateArticle = asyncHandler(async (req, res) => {
  const user = req.user;
  const articleId = req.params.articleId;
  const { title, body: content } = req.body;

  const query = `
    UPDATE articles
    SET title = ?, content = ?, last_change = datetime('now', 'localtime')
    WHERE user_id = ? AND article_id = ?;
  `;
  await dbUtils.run(query, [title, content, user.id, articleId]);
  res.redirect(`/author/create/${articleId}`);
});

const articleActions = {
  pub: (articles, userId) => ({
    query: `UPDATE articles SET status = 'pub', published = datetime('now', 'localtime') 
            WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`,
    params: [...articles, userId]
  }),
  del: (articles, userId) => ({
    queries: [
      {
        query: `DELETE FROM comments WHERE article_id IN (${articles.map(() => '?').join(',')});`,
        params: articles
      },
      {
        query: `DELETE FROM articles WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`,
        params: [...articles, userId]
      }
    ]
  }),
  take_off: (articles, userId) => ({
    query: `UPDATE articles SET status = 'draft', removed_from_publication_views = datetime('now', 'localtime') 
            WHERE article_id IN (${articles.map(() => '?').join(',')}) AND user_id = ?;`,
    params: [...articles, userId]
  })
};

const articleAction = asyncHandler(async (req, res) => {
  const user = req.user;
  const { action } = req.body;
  const articles = Object.keys(req.body)
    .filter(key => key !== 'action')
    .map(Number);

  if (articles.some(isNaN)) {
    throw new Error('Invalid article ID');
  }

  const actionFunction = articleActions[action];
  if (!actionFunction) {
    throw new Error('Unknown action');
  }

  const actionData = actionFunction(articles, user.id);

  if (action === 'del') {
    // Для действия удаления выполняем несколько запросов
    for (const queryData of actionData.queries) {
      await dbUtils.run(queryData.query, queryData.params);
    }
  } else {
    // Для других действий выполняем один запрос
    await dbUtils.run(actionData.query, actionData.params);
  }

  res.redirect('/author/home-page');
});

const homePage = asyncHandler(async (req, res) => {
  const user = req.user;
  const userInfo = await dbUtils.get("SELECT * FROM users WHERE user_id = ?;", [user.id]);
  const articles = await dbUtils.all("SELECT * FROM articles WHERE user_id = ?;", [user.id]);

  res.render(res.locals.layout, {
    title: 'Home page',
    content: 'home-page',
    user: userInfo,
    articles
  });
});

const addComment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { comment } = req.body;
  const article_id = req.params.article_id;

  if (!comment || comment.trim() === "") {
    return res.redirect(`/reader/${article_id}`);
  }

  await dbUtils.run("INSERT INTO comments (user_id, article_id, comment) VALUES (?, ?, ?);", [user.id, article_id, comment]);
  res.redirect(`/reader/${article_id}`);
});

const loginPage = (req, res) => {
  res.render(res.locals.layout, { title: 'Log in to your account', content: 'login' });
};

const login = asyncHandler(async (req, res) => {
  const { email, psw } = req.body;
  const user = await dbUtils.get("SELECT * FROM users WHERE email = ?;", [email]);

  if (user && psw === user.password) {
    const token = jwt.sign({ id: user.user_id }, SECRET_KEY, { expiresIn: '4h' });
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/author/home-page');
  } else {
    throw new Error(user ? "Invalid password" : "User not found");
  }
});

const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};

const addUser = asyncHandler(async (req, res) => {
  const userData = req.body;
  validateUser(userData);

  const { first_name, last_name, email, psw } = userData;
  const query = "INSERT INTO users (first_name, last_name, email, password) VALUES(?, ?, ?, ?);";
  const result = await dbUtils.run(query, [first_name, last_name, email, psw]);

  const token = jwt.sign({ id: result.lastID }, SECRET_KEY, { expiresIn: '4h' });
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/author/home-page');
});

const profileSettingsPage = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await dbUtils.get("SELECT blog, first_name, last_name FROM users WHERE user_id = ?;", [userId]);

  if (!user) {
    throw new Error('User not found');
  }

  res.render(res.locals.layout, { title: 'Setting', content: 'profile-settings', user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { blog, first_name, last_name, psw, psw_repeat } = req.body;

  let updateUserQuery = '';
  let params = [];

  if (psw) {
    if (psw !== psw_repeat) {
      throw new Error("Passwords don't match");
    }
    updateUserQuery = "UPDATE users SET password = ? WHERE user_id = ?;";
    params = [psw, user_id];
  } else {
    updateUserQuery = "UPDATE users SET blog = ?, first_name = ?, last_name = ? WHERE user_id = ?;";
    params = [blog, first_name, last_name, user_id];
  }
  
  await dbUtils.run(updateUserQuery, params);
  res.redirect('/author/settings');
});

module.exports = {
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