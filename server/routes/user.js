const express = require("express");
const router = express.Router();
const {
  registerUser,
  login,
  getUserById,
  updateUserDetails,
  getUserCart,
  updateUserCart,
  deleteUser,
} = require("../controllers/user");
const {
  registerValidator,
  loginValidator,
  updateValidator,
  updateUserCartValidator,
} = require("../middlewares/validators/user");
const { isAuthenticated } = require("../middlewares/authenticator/auth");

router.post("/signup", registerValidator, registerUser);

router.post("/login", loginValidator, login);

router.put("/:id", updateValidator, isAuthenticated, updateUserDetails);

router.delete("/:id", isAuthenticated, deleteUser);

router.get("/:id", isAuthenticated, getUserById);

router.get("/:id/cart", isAuthenticated, getUserCart);

router.put("/:id/cart", updateUserCartValidator, isAuthenticated, updateUserCart);

module.exports = router;
