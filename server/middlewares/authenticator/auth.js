const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1] || "";
  let jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.isAdmin !== true) {
    res.status(405).json({ message: "Only admin allowed" });
  }
  next();
};

module.exports = { isAuthenticated, authorizeAdmin };
