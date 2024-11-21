const { check } = require("express-validator");

const reviewValidator = [
  check("restaurantId")
    .notEmpty()
    .withMessage("Restaurant ID is required"),
  check("userName")
    .notEmpty()
    .withMessage("User Name is required"),
  check("restName")
    .notEmpty()
    .withMessage("Restaurant Name is required"),
  check("userId")
    .notEmpty()
    .withMessage("User ID is required"),
  check("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  check("feedback")
    .notEmpty()
    .withMessage("Feedback is required")
    .isLength({ max: 500 })
    .withMessage("Feedback must not exceed 500 characters"),
  check("createdAt")
    .notEmpty()
    .withMessage("CreatedAt is required")
];

module.exports = { reviewValidator };
