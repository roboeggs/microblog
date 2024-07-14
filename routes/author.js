const express = require("express");
const router = express.Router();
const authorController = require('../controllers/authorController');
const auth = require('../middlewares/auth');

// Обработка запросов на главную страницу
router.get('/', auth.verifyToken, authorController.homePage);

router.get("/login", authorController.loginPage);
router.post("/login", authorController.login);
router.post("/logout", authorController.logout);
router.post("/add-author", authorController.addUser);
router.get("/add-author", authorController.addUserPage);

router.get("/create/:articleId?", auth.verifyToken, authorController.createArticlePage);
router.post("/create", auth.verifyToken, authorController.createArticle);
router.post("/update/:articleId", auth.verifyToken, authorController.updateArticle);
router.post("/action", auth.verifyToken, authorController.articleAction);
router.get("/home-page", auth.verifyToken, authorController.homePage);
router.post("/comment/:article_id", auth.verifyToken, authorController.addComment);

// Route for profile settings page
router.get('/settings', auth.verifyToken, authorController.profileSettingsPage);
router.post('/settings', auth.verifyToken, authorController.updateProfile);

module.exports = router;