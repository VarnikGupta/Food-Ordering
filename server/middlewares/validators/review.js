const { body } = require("express-validator");

const reviewValidator = [
  body("restId").notEmpty().withMessage("Restaurant ID is required"),
  body("userName").notEmpty().withMessage("User Name is required"),
  body("restName").notEmpty().withMessage("Restaurant Name is required"),
  body("userId").notEmpty().withMessage("User ID is required"),
  body("rating")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Rating is required")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5"),
  body("feedback")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Feedback is required")
    .isLength({ max: 500 })
    .withMessage("Feedback must not exceed 500 characters"),
];

module.exports = { reviewValidator };
