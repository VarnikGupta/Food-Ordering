const { body, query, oneOf } = require("express-validator");

const reviewValidator = [
  body("restId")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Restaurant ID is required"),
  body("userName")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("User Name is required"),
  body("restName")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Restaurant Name is required"),
  body("userId")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("User ID is required"),
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

const getReviewValidator = [
  oneOf(
    [
      query("restId").exists({ checkFalsy: true, checkNull: true }),
      query("userId").exists({ checkFalsy: true, checkNull: true }),
    ],
    {
      message:
        "At least one field from restId or userId must be provided to fetch reviews",
    }
  ),
];

module.exports = { reviewValidator, getReviewValidator };
