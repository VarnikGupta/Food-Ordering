const express = require("express");
const { isAuthenticated } = require("../middlewares/authenticator/auth");
const { reviewValidator, getReviewValidator } = require("../middlewares/validators/review");
const { createReview, getReviews } = require("../controllers/review");
const router = express.Router();

router.post("/", reviewValidator, isAuthenticated, createReview);

router.get("/", getReviewValidator, getReviews);

module.exports = router;
