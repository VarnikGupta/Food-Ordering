const express = require("express");
const { search } = require("../controllers/search");
const { searchValidator } = require("../middlewares/validators/search");
const router = express.Router();

router.get("/", searchValidator, search);

module.exports = router;
