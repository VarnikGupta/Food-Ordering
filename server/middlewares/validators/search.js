const { query, oneOf } = require("express-validator");

const searchValidator = [
  oneOf(
    [
      query("restName").exists({ checkFalsy: true, checkNull: true }),
      query("dishName").exists({ checkFalsy: true, checkNull: true }),
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
