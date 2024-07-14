const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');


router.get('/', articleController.getArticles);

// Получение конкретной статьи
router.get('/:id', articleController.getArticle);

// Лайк статьи
router.get('/like/:id', articleController.likeArticle);

module.exports = router;