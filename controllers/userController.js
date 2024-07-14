const dbUtils = require('../utils/dbUtils');
const asyncHandler = require('../utils/asyncHandler');


const listUsers = asyncHandler(async (req, res) => {
    const rows = await dbUtils.all("SELECT * FROM users");
    res.json(rows);
  });


const listComments = asyncHandler(async (req, res) => {
    const rows = await dbUtils.all("SELECT * FROM comments");
    res.json(rows);
});

const listArticles = asyncHandler(async (req, res) => {
    const rows = await dbUtils.all("SELECT * FROM articles");
    res.json(rows);
});

module.exports = {
    listUsers,
    listComments,
    listArticles
}