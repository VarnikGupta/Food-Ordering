const express = require("express");
const { isAuthenticated } = require("../middlewares/authenticator/auth");
const { reviewValidator } = require("../middlewares/validators/review");
const { createReview, getReviews } = require("../controllers/review");
const router = express.Router();

router.post("/", reviewValidator, isAuthenticated, createReview);

router.get("/", getReviews);

module.exports = router;
