const { query, oneOf } = require("express-validator");

const searchValidator = [
  oneOf(
    [
      query("restName")
        .isString()
        .withMessage("Restaurant name must be a string."),
      query("dishName")
        .isString()
        .withMessage("Dish name must be a string."),
    ],
    {
      message:
        "At least one field from rest name or dish name must be provided to query seach",
    }
  ),
];

module.exports = {
  searchValidator,
};
