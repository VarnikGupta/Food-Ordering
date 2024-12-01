const { validationResult } = require("express-validator");
const { documentClient } = require("../database/db");

const validateBody = validationResult.withDefaults({
  formatter: (err) => {
    return {
      err: true,
      message: err.msg,
    };
  },
});

const search = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  }

  const { name, address, minRating, maxRating, minCost, maxCost } = req.query;
  try {
    const restaurantParams = {
      TableName: "FoodOrdering",
      IndexName: "GSI1",
      KeyConditionExpression: "#pk = :pk AND begins_with(#sk,:sk)",
      FilterExpression: "contains(#name, :name)",
      ExpressionAttributeNames: {
        "#pk": "GSI1_PK",
        "#sk": "GSI1_SK",
        "#name": "name",
      },
      ExpressionAttributeValues: {
        ":pk": "Restaurant",
        ":sk": "Rest#",
        ":name": name.toLowerCase(),
      },
    };

    if (address) {
      if (address.addressLine) {
        restaurantParams.FilterExpression +=
          " AND contains(#location.#addressLine, :addressLine)";
        restaurantParams.ExpressionAttributeValues[":addressLine"] =
          address.addressLine;
        restaurantParams.ExpressionAttributeNames["#location"] = "location";
        restaurantParams.ExpressionAttributeNames["#addressLine"] =
          "addressLine";
      }

      if (address.street) {
        restaurantParams.FilterExpression +=
          " AND contains(#location.#street, :street)";
        restaurantParams.ExpressionAttributeValues[":street"] = address.street;
        restaurantParams.ExpressionAttributeNames["#location"] = "location";
        restaurantParams.ExpressionAttributeNames["#street"] = "street";
      }

      if (address.state) {
        restaurantParams.FilterExpression +=
          " AND contains(#location.#state, :state)";
        restaurantParams.ExpressionAttributeValues[":state"] = address.state;
        restaurantParams.ExpressionAttributeNames["#location"] = "location";
        restaurantParams.ExpressionAttributeNames["#state"] = "state";
      }

      if (address.country) {
        restaurantParams.FilterExpression +=
          " AND contains(#location.#country, :country)";
        restaurantParams.ExpressionAttributeValues[":country"] =
          address.country;
        restaurantParams.ExpressionAttributeNames["#location"] = "location";
        restaurantParams.ExpressionAttributeNames["#country"] = "country";
      }
    }

    if (minRating || maxRating) {
      restaurantParams.FilterExpression += ` AND #rating BETWEEN :minRating AND :maxRating`;
      restaurantParams.ExpressionAttributeValues[":minRating"] =
        parseInt(minRating) || 1;
      restaurantParams.ExpressionAttributeValues[":maxRating"] = parseInt(maxRating) || 5;
      restaurantParams.ExpressionAttributeNames["#rating"] = "rating";
    }

    const dishParams = {
      TableName: "FoodOrdering",
      IndexName: "GSI1",
      KeyConditionExpression: "#pk = :pk AND begins_with(#sk,:sk)",
      // FilterExpression: "",
      ExpressionAttributeNames: {
        "#pk": "GSI1_PK",
        "#sk": "GSI1_SK",
      },
      ExpressionAttributeValues: {
        ":pk": `Dish#${name.toLowerCase()}`,
        ":sk": `Rest#`,
      },
    };

    if (minCost || maxCost) {
      dishParams.FilterExpression += `#cost BETWEEN :minCost AND :maxCost`;
      dishParams.ExpressionAttributeValues[":minCost"] = parseInt(minCost) || 1;
      dishParams.ExpressionAttributeValues[":maxCost"] =
        parseInt(maxCost) || 10000;
      dishParams.ExpressionAttributeNames["#cost"] = "cost";
    }

    const [restaurantResult, dishResult] = await Promise.all([
      documentClient.query(restaurantParams).promise(),
      documentClient.query(dishParams).promise(),
    ]);

    const restaurants = restaurantResult.Items.map((item) => ({
      type: "restaurant",
      restName: item.name,
      rating: item.rating,
      location: item.location,
      ratingCount: item.ratingCount,
      restId: item.restId,
    }));

    const dishes = dishResult.Items.map((item) => ({
      type: "dish",
      dishName: item.dishName,
      category: item.category,
      cuisine: item.cuisine,
      cost: item.cost,
      restName: item.restName,
      restId: item.restId
    }));

    const searchItems = [...restaurants, ...dishes];

    return res.status(200).json({
      message: "Search results successful",
      searchItems,
    });
  } catch (err) {
    console.error("Error in search:", err);
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

module.exports = { search };
