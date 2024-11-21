const { body } = require("express-validator");

const restaurantValidator = [
  body("name").not().isEmpty().withMessage("Restaurant Name is required"),
  body("location")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Location is required"),
  body("contact")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Phone number is required")
    .isLength(10)
    .withMessage("Enter a valid phone number"),
];

const updateMenuValidator = [
  body("menuItems")
    .isArray({ min: 1 })
    .withMessage("menuItems must be a non-empty array."),
  body("menuItems.*.dishName")
    .isString()
    .notEmpty()
    .withMessage("Each menu item must have a non-empty dishName."),
  body("menuItems.*.cuisine")
    .isString()
    .notEmpty()
    .withMessage("Each menu item must have a non-empty cuisine."),
  body("menuItems.*.cost")
    .isFloat({ gt: 0 })
    .withMessage("Each menu item must have a valid cost greater than 0."),
  body("menuItems.*.price")
    .isFloat({ gt: 0 })
    .withMessage("Each menu item must have a valid price greater than 0."),
];

module.exports = { restaurantValidator, updateMenuValidator };
