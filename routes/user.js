const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get("/list-users", userController.listUsers);
router.get("/list-comments", userController.listComments);
router.get("/list-articles", userController.listArticles);

module.exports = router;