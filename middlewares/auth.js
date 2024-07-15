const jwt = require('jsonwebtoken'); // importing the jsonwebtoken module
const SECRET_KEY = 'small-blog-key';    // defining a secret key for signing the tokens

// Middleware function to verify the token
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;    // Extracting the token from the cookies
    if (!token) {   // If there's no token, redirect the user to the login page
        return res.redirect('/users/login');
    }
    // Verifying the token using the secret key
    jwt.verify(token, SECRET_KEY, (err, user) => {
        // If there's an error (token is invalid or expired), redirect the user to the login page
        if (err) {
            return res.redirect('/users/login');
        }
        // If the token is valid, attach the user object to the request
        req.user = user;
        next(); // Pass control to the next middleware function
    });
};

module.exports = {
    verifyToken
};
