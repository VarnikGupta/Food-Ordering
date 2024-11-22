const { body, oneOf } = require("express-validator");

const registerValidator = [
  body("name")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Name is required"),
  body("email").isEmail().withMessage("Enter valid email address"),
  body("phone")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Phone number is required")
    .isLength(10)
    .withMessage("Enter a valid phone number"),
  body("address")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Address is required"),
  body("password")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

const loginValidator = [
  body("email").isEmail().withMessage("Enter valid email address"),
  body("password")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Password is required"),
];

const updateValidator = [
  oneOf(
    [
      body("name").exists().withMessage("Name is required"),
      body("address").exists().withMessage("Address is required"),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
      body("phone")
        .isLength({ min: 10, max: 10 })
        .withMessage("Enter a valid phone number")
   ],
    {
      message: "At least one field from name, address, password, phone must be provided",
    }
  ),
];

const updateUserCartValidator = [
  body("action")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Action is required")
    .isIn(["add", "remove"])
    .withMessage("Action must be 'add' or 'remove'"),
  body("item")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Item object is required")
    .isObject()
    .withMessage("Item must be an object"),
];

module.exports = { registerValidator, loginValidator, updateValidator, updateUserCartValidator };
