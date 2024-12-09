const { validationResult } = require("express-validator");
const { documentClient } = require("../config/db");
const { redisCalls } = require("../services/cache");

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
    const cacheKey = `search:${JSON.stringify({
      name,
      address,
      minRating,
      maxRating,
      minCost,
      maxCost,
    })}`;

    const cachedResults = await redisCalls("string", "get", cacheKey);
    if (cachedResults) {
      return res.status(200).json({
        message: "Search results fetched from cache",
        searchItems: cachedResults,
      });
    }

    const restaurantParams = {
      TableName: "FoodOrdering",
      IndexName: "GSI1",
      KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :sk)",
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
      ["addressLine", "street", "state", "country"].forEach((field) => {
        if (address[field]) {
          const attrName = `#${field}`;
          const attrValue = `:${field}`;
          restaurantParams.FilterExpression += ` AND contains(#location.${attrName}, ${attrValue})`;
          restaurantParams.ExpressionAttributeValues[attrValue] = address[field];
          restaurantParams.ExpressionAttributeNames[`#location`] = "location";
          restaurantParams.ExpressionAttributeNames[attrName] = field;
        }
      });
    }

    if (minRating || maxRating) {
      restaurantParams.FilterExpression += " AND #rating BETWEEN :minRating AND :maxRating";
      restaurantParams.ExpressionAttributeValues[":minRating"] = parseInt(minRating) || 1;
      restaurantParams.ExpressionAttributeValues[":maxRating"] = parseInt(maxRating) || 5;
      restaurantParams.ExpressionAttributeNames["#rating"] = "rating";
    }

    const dishParams = {
      TableName: "FoodOrdering",
      IndexName: "GSI1",
      KeyConditionExpression: "#pk = :pk AND begins_with(#sk, :sk)",
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
      dishParams.FilterExpression = `#cost BETWEEN :minCost AND :maxCost`;
      dishParams.ExpressionAttributeValues[":minCost"] = parseInt(minCost) || 1;
      dishParams.ExpressionAttributeValues[":maxCost"] = parseInt(maxCost) || 10000;
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
      restId: item.restId,
    }));

    const searchItems = [...restaurants, ...dishes];

    await redisCalls("string", "set", cacheKey, 600, searchItems);

    return res.status(200).json({
      message: "Search results fetched successfully",
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
