require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/user");
const restaurantRoutes = require("./routes/restaurant");
const orderRoutes = require("./routes/order");
const reviewRoutes = require("./routes/review");
const searchRoutes = require("./routes/search");
const { create } = require("./config/tables");
const { deleteTable } = require("./config/db");
const cors = require('cors');


const app = express();
const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// create();
// deleteTable("FoodOrdering")

app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/search", searchRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
