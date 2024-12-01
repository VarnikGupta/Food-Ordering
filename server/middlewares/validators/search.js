const { query, oneOf } = require("express-validator");

const searchValidator = [
  query("name").exists({ checkFalsy: true, checkNull: true }),
];

module.exports = {
  searchValidator,
};
