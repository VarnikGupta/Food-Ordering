const express = require("express");
const { search } = require("../controllers/search");
const { searchValidator } = require("../middlewares/validators/search");
const { isAuthenticated } = require("../middlewares/authenticator/auth");
const router = express.Router();

router.get("/", searchValidator, isAuthenticated, search);

module.exports = router;
