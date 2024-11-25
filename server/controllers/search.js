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
  console.log(req.query);
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

      // Add filters for address if provided
      if (address) {
        if (address.addressLine) {
          params.FilterExpression +=
            " AND contains(#location.#addressLine, :addressLine)";
          params.ExpressionAttributeValues[":addressLine"] = address.addressLine;
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

      // Add rating filter if min/max ratings are provided
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
    console.log(params);
    const result = await documentClient.query(params).promise();

    return res.status(200).json({
      message: "Search results successful",
      searchItems: result.Items,
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
