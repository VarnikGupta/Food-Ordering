const { body, oneOf, query } = require("express-validator");

const orderValidator = [
  body("userId")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("userId is required"),
  body("amount")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Amount is required")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),
  body("restId")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Restaurant ID (restId) is required"),
  body("restName")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Restaurant name (restName) is required"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required in the order"),
  body("items.*.dishName")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Item must have a non-empty dishName."),
  body("items.*.quantity")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Item must have a non-empty quantity."),
  body("items.*.price")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Item must have a valid price greater than 0."),
//   body("deliveryAddress")
//     .exists({ checkFalsy: true, checkNull: true })
//     .withMessage("Delivery address is required"),
];

const updateOrderValidator = [
  oneOf(
    [
      body("status")
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage("Status is required")
        .isIn(["Preparing", "Completed", "Cancelled"])
        .withMessage(
          "Status must be one of: 'Preparing', 'Completed', or 'Cancelled'"
        ),
      body("favourite")
        .exists({ checkNull: true })
        .withMessage("favourite is required")
        .isBoolean()
        .withMessage("favourite must be a boolean value"),
    ],
    {
      message: "At least one field from status or favourite must be provided",
    }
  ),
];

const orderHistoryValidator = [
  oneOf(
    [
      query("userId")
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage("userId is required"),
      query("restId")
        .exists({ checkFalsy: true, checkNull: true })
        .withMessage("restId is required"),
    ],
    {
      message: "At least one field from userId or restId must be provided",
    }
  ),
];

module.exports = { orderValidator, updateOrderValidator, orderHistoryValidator };
