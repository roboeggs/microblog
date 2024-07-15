const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Route to get all articles
router.get('/', articleController.getArticles);

// Route to get a specific article by ID
router.get('/:id', articleController.getArticle);

// Route to like an article by ID
router.get('/like/:id', articleController.likeArticle);

module.exports = router;