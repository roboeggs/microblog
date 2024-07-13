const jwt = require('jsonwebtoken');
const SECRET_KEY = 'small-blog-key';

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.sendStatus(403);
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

module.exports = {
    verifyToken
};
