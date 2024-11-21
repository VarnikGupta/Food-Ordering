const { documentClient } = require("../database/db");

const search = async (req, res) => {
  const { restName, address, minRating, maxRating, dishName, cost } = req.query;

  try {
    let params;
    if (restName) {
      params = {
        TableName: "FoodOrdering",
        IndexName: "GSI1",
        KeyConditionExpression: "#pk = :pk",
        FilterExpression: "contains(#name, :restName)",
        ExpressionAttributeNames: {
          "#pk": "PK",
          "#name": "Name",
          "#address": "address",
          "#rating": "Rating",
        },
        ExpressionAttributeValues: {
          ":pk": "Restaurant",
          ":restName": restName || "",
        },
      };

      if (address) {
        if (address.street) {
          restaurantParams.FilterExpression = `${
            restaurantParams.FilterExpression || ""
          } AND contains(#address.#street, :street)`;
          restaurantParams.ExpressionAttributeValues[":street"] =
            address.street;
        }

        if (address.state) {
          restaurantParams.FilterExpression = `${
            restaurantParams.FilterExpression || ""
          } AND contains(#address.#state, :state)`;
          restaurantParams.ExpressionAttributeValues[":state"] = address.state;
        }

        if (address.country) {
          restaurantParams.FilterExpression = `${
            restaurantParams.FilterExpression || ""
          } AND contains(#address.#country, :country)`;
          restaurantParams.ExpressionAttributeValues[":country"] =
            address.country;
        }
      }

      if (minRating || maxRating) {
        restaurantParams.FilterExpression = `${
          restaurantParams.FilterExpression || ""
        } AND #rating BETWEEN :minRating AND :maxRating`;
        restaurantParams.ExpressionAttributeValues[":minRating"] =
          minRating || 1;
        restaurantParams.ExpressionAttributeValues[":maxRating"] =
          maxRating || 5;
      }
    } else {
      params = {
        TableName: "FoodOrdering",
        IndexName: "GSI1",
        KeyConditionExpression: "#pk = :pk",
        ExpressionAttributeNames: {
          "#pk": "PK",
        },
        ExpressionAttributeValues: {
          ":pk": `Dish#${dishName}`,
        },
      };

      if (cost) {
        dishParams.FilterExpression = "#cost = :cost";
        dishParams.ExpressionAttributeValues[":cost"] = parseFloat(cost);
      }
    }

    const result = await documentClient.query(params).promise();

    return res.status(200).json({
      message: "search results succesful",
      restaurants: result.Items,
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
