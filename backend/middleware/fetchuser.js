const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET; // Use .env secret

const fetchuser = (req, res, next) => {
    // Get the user from JWT token
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Kindly Authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({ error: "Kindly Authenticate using a valid token" });
    }
};

module.exports = fetchuser;
