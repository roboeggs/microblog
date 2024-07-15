// Import Express and create a new router
const express = require('express');
const router = express.Router();

// Import the user controller
const userController = require('../controllers/userController');

//Routes for getting data from tables
router.get("/list-users", userController.listUsers);
router.get("/list-comments", userController.listComments);
router.get("/list-articles", userController.listArticles);

module.exports = router;
