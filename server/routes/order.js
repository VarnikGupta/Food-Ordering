const express = require("express");
const {
  createOrder,
  getOrderHistory,
  getOrderDetails,
  updateOrderStatus,
} = require("../controllers/order");
const {
  orderValidator,
  orderStatusValidator,
} = require("../middlewares/validators/order");
const { isAuthenticated, isAuthorized } = require("../middlewares/authenticator/auth");
const router = express.Router();

router.get("/:userId/order-history", isAuthenticated, getOrderHistory);

router.get("/userId/:userId/orderId/:orderId", isAuthenticated, getOrderDetails);

router.post("/", orderValidator, isAuthenticated, createOrder);

router.put("/userId/:userId/orderId/:orderId", orderStatusValidator, isAuthorized, updateOrderStatus);

module.exports = router;