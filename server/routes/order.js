const express = require("express");
const {
  createOrder,
  getOrderHistory,
  getOrderDetails,
  updateOrderDetails,
} = require("../controllers/order");
const {
  orderValidator,
  updateOrderValidator,
  orderHistoryValidator,
} = require("../middlewares/validators/order");
const { isAuthenticated, isAuthorized } = require("../middlewares/authenticator/auth");
const router = express.Router();

router.get("/order-history", orderHistoryValidator, isAuthenticated, getOrderHistory);

router.get("/userId/:userId/orderId/:orderId", isAuthenticated, getOrderDetails);

router.post("/", orderValidator, isAuthenticated, createOrder);

router.put("/userId/:userId/orderId/:orderId", updateOrderValidator, isAuthorized, updateOrderDetails);

module.exports = router;