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

  const {
    restName,
    address,
    minRating,
    maxRating,
    dishName,
    minCost,
    maxCost,
  } = req.query;
  try {
    let params;

    if (restName) {
      params = {
        TableName: "FoodOrdering",
        IndexName: "GSI1",
        KeyConditionExpression: "#pk = :pk AND begins_with(#sk,:sk)",
        FilterExpression: "contains(#name, :restName)",
        ExpressionAttributeNames: {
          "#pk": "GSI1_PK",
          "#sk": "GSI1_SK",
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":pk": "Restaurant",
          ":sk": "Rest#",
          ":restName": restName.toLowerCase(),
        },
      };

      if (address) {
        if (address.addressLine) {
          params.FilterExpression +=
            " AND contains(#location.#addressLine, :addressLine)";
          params.ExpressionAttributeValues[":addressLine"] =
            address.addressLine;
          params.ExpressionAttributeNames["#location"] = "location";
          params.ExpressionAttributeNames["#addressLine"] = "addressLine";
        }

        if (address.street) {
          params.FilterExpression +=
            " AND contains(#location.#street, :street)";
          params.ExpressionAttributeValues[":street"] = address.street;
          params.ExpressionAttributeNames["#location"] = "location";
          params.ExpressionAttributeNames["#street"] = "street";
        }

        if (address.state) {
          params.FilterExpression += " AND contains(#location.#state, :state)";
          params.ExpressionAttributeValues[":state"] = address.state;
          params.ExpressionAttributeNames["#location"] = "location";
          params.ExpressionAttributeNames["#state"] = "state";
        }

        if (address.country) {
          params.FilterExpression +=
            " AND contains(#location.#country, :country)";
          params.ExpressionAttributeValues[":country"] = address.country;
          params.ExpressionAttributeNames["#location"] = "location";
          params.ExpressionAttributeNames["#country"] = "country";
        }
      }

      if (minRating || maxRating) {
        params.FilterExpression += ` AND #rating BETWEEN :minRating AND :maxRating`;
        params.ExpressionAttributeValues[":minRating"] =
          parseInt(minRating) || 1;
        params.ExpressionAttributeValues[":maxRating"] = maxRating || 5;
        params.ExpressionAttributeNames["#rating"] = "rating";
      }
    } else {
      params = {
        TableName: "FoodOrdering",
        IndexName: "GSI1",
        KeyConditionExpression: "#pk = :pk AND begins_with(#sk,:sk)",
        FilterExpression: "",
        ExpressionAttributeNames: {
          "#pk": "GSI1_PK",
          "#sk": "GSI1_SK",
        },
        ExpressionAttributeValues: {
          ":pk": `Dish#${dishName.toLowerCase()}`,
          ":sk": `Rest#`,
        },
      };

      if (minCost || maxCost) {
        params.FilterExpression += `#cost BETWEEN :minCost AND :maxCost`;
        params.ExpressionAttributeValues[":minCost"] = parseInt(minCost) || 1;
        params.ExpressionAttributeValues[":maxCost"] =
          parseInt(maxCost) || 10000;
        params.ExpressionAttributeNames["#cost"] = "cost";
      }
    }
    const result = await documentClient.query(params).promise();
    let searchItems=[];
    if (restName) {
      searchItems = result.Items.map((item) => ({
        restName: item.name,
        rating: item.rating,
        location: item.location,
        ratingCount: item.ratingCount,
        restId: item.restId,
      }));
    } else {
      searchItems = result.Items.map((item) => ({
        dishName: item.dishName,
        category: item.category,
        cuisine: item.cuisine,
        cost: item.cost,
        restName: item.restName,
      }));
    }

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
