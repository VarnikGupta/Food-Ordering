const { body } = require("express-validator");

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
    .withMessage("At least one item is required in the order")
    .custom((value) => {
      value.forEach((item) => {
        if (!item.dishName || !item.quantity || !item.price) {
          throw new Error(
            "Each item must contain dishName, quantity, and price."
          );
        }
        if (item.quantity <= 0) {
          throw new Error("Quantity must be greater than 0.");
        }
        if (item.price <= 0) {
          throw new Error("Price must be greater than 0.");
        }
      });
      return true;
    }),

  body("deliveryAddress")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Delivery address is required"),
];

const orderStatusValidator = [
  body("status")
    .exists({ checkFalsy: true, checkNull: true })
    .withMessage("Status is required")
    .isIn(["Preparing", "Completed", "Cancelled"])
    .withMessage(
      "Status must be one of: 'Preparing', 'Completed', or 'Cancelled'"
    ),
];

module.exports = { orderValidator, orderStatusValidator };
