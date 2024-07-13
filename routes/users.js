const express = require("express");
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router.get("/list-users", userController.listUsers);
router.get("/add-user", userController.addUserPage);
router.get("/create/:articleId?", userController.createArticlePage);
router.post("/create", auth.verifyToken, userController.createArticle);
router.post("/action", auth.verifyToken, userController.articleAction);
router.get("/home-page", auth.verifyToken, userController.homePage);
router.post("/comment/:article_id", auth.verifyToken, userController.addComment);
router.get("/login", userController.loginPage);
router.post("/login", userController.login);
router.post("/add-user", userController.addUser);

module.exports = router;