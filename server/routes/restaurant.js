const express = require("express");
const {
  addRestaurant,
  getMenu,
  updateMenu,
  getRestaurantById,
} = require("../controllers/restaurant");
const {
  restaurantValidator,
  updateMenuValidator,
} = require("../middlewares/validators/restaurant");
const { authorizeAdmin } = require("../middlewares/authenticator/auth");
const router = express.Router();

router.post("/", restaurantValidator, addRestaurant);

router.get("/:id", getRestaurantById);

router.get("/:id/menu", getMenu);

router.put("/:id/menu", updateMenuValidator, 
  // authorizeAdmin, 
  updateMenu);

module.exports = router;
