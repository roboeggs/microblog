const jwt = require('jsonwebtoken');
const SECRET_KEY = 'small-blog-key';

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/users/login');
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.redirect('/users/login');
        }
        req.user = user;
        next();
    });
};

module.exports = {
    verifyToken
};
