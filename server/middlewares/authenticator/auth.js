const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1] || "";
  let jwtSecretKey = process.env.JWT_SECRET_KEY;

  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    const userId = req.body.userId || req.params.userId || req.params.id;
    if (userId && userId !== decoded.userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this resource" });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorizeAdmin = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1] || "";
  const jwtSecretKey = process.env.JWT_SECRET_KEY;

  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    if (decoded.isAdmin !== true) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

const isAuthorized = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1] || "";
  const jwtSecretKey = process.env.JWT_SECRET_KEY;

  if (!token) {
    return res.status(401).json({ message: "Authorization token is missing" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    const userId = req.body.userId || req.params.userId || req.params.id;
    if (decoded.isAdmin) {
      return next();
    }
    if (userId && userId !== decoded.userId) {
      return res.status(403).json({
        message: "You are not authorized to access this resource",
      });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { isAuthenticated, authorizeAdmin, isAuthorized };
