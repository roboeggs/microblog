// Import modules
const dbUtils = require('../utils/dbUtils');
const asyncHandler = require('../utils/asyncHandler');

// Function to list data from a table
const listData = (tableName) => asyncHandler(async (req, res) => {
    const rows = await dbUtils.all(`SELECT * FROM ${tableName}`);
    res.json(rows);
});

// Export functions
module.exports = {
    listUsers: listData('users'),
    listComments: listData('comments'),
    listArticles: listData('articles')
}
