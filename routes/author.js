const express = require("express");
const router = express.Router();
const authorController = require('../controllers/authorController'); // Importing author controller
const auth = require('../middlewares/auth'); // Importing authentication middleware

// Routes for handling user authentication
router.get("/login", authorController.loginPage); // GET request to render login page
router.post("/login", authorController.login); // POST request to handle login
router.post("/logout", authorController.logout); // POST request to handle logout
router.post("/add-author", authorController.addUser); // POST request to handle user registration
router.get("/add-author", authorController.addUserPage); // GET request to render add user page

// Routes for article management
router.get("/create/:articleId?", auth.verifyToken, authorController.createArticlePage); // GET request to render create article page
router.post("/create", auth.verifyToken, authorController.createArticle); // POST request to create a new article
router.post("/update/:articleId", auth.verifyToken, authorController.updateArticle); // POST request to update an existing article
router.post("/action", auth.verifyToken, authorController.articleAction); // POST request to perform actions on articles (publish, delete, take off)
router.get("/home-page", auth.verifyToken, authorController.homePage); // GET request to render home page with user info and articles
router.post("/comment/:article_id", auth.verifyToken, authorController.addComment); // POST request to add a comment to an article

// Route for profile settings page
router.get('/settings', auth.verifyToken, authorController.profileSettingsPage); // GET request to render profile settings page
router.post('/settings', auth.verifyToken, authorController.updateProfile); // POST request to update user profile settings

module.exports = router;
