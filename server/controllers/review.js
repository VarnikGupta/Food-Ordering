const { documentClient } = require("../database/db");
const { validationResult } = require("express-validator");

const validateBody = validationResult.withDefaults({
  formatter: (err) => {
    return {
      err: true,
      message: err.msg,
    };
  },
});

const createReview = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  }
  const { restId, userId, rating, feedback, userName, restName } = req.body;
  const createdAt = Math.floor(Date.now() / 1000);

  try {
    const getRestParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `Rest#${restId}`,
        SK: "RestDetails",
      },
    };
    const restResult = await documentClient.get(getRestParams).promise();
    if (!restResult.Item) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const getUserParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: "Profile",
      },
    };
    const userResult = await documentClient.get(getUserParams).promise();
    if (!userResult.Item) {
      return res.status(404).json({ message: "User not found" });
    }

    const params = {
      TableName: "FoodOrdering",
      Item: {
        PK: `User#${userId}`,
        SK: `Review#${createdAt}#${restId}`,
        GSI1_PK: `Rest#${restId}`,
        GSI1_SK: `Review#${createdAt}`,
        userId,
        restId,
        userName,
        restName,
        feedback,
        rating,
        createdAt,
      },
    };
    await documentClient.put(params).promise();

    const currentRating = restResult.Item.rating || 0;
    const currentRatingCount = restResult.Item.ratingCount || 0;

    const newRating =
      (currentRating * currentRatingCount + rating) / (currentRatingCount + 1);
    const newRatingCount = currentRatingCount + 1;

    const updateRatingParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `Rest#${restId}`,
        SK: "RestDetails",
      },
      UpdateExpression: `
        SET 
          #rating = :newRating,
          #ratingCount = :newRatingCount
      `,
      ExpressionAttributeNames: {
        "#rating": "rating",
        "#ratingCount": "ratingCount",
      },
      ExpressionAttributeValues: {
        ":newRating": newRating,
        ":newRatingCount": newRatingCount,
      },
      ReturnValues: "UPDATED_NEW",
    };

    await documentClient.update(updateRatingParams).promise();

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
    });
  } catch (err) {
    console.error("Error creating new review: ", err);
    return res.status(500).json({
      err: true,
      message: "Internal server error",
    });
  }
};

const getReviews = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  }
  const { userId, restId } = req.query;
  let queryParams;
  if (userId) {
    queryParams = {
      TableName: "FoodOrdering",
      KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `User#${userId}`,
        ":sk": "Review#",
      },
    };
  } else if (restId) {
    queryParams = {
      TableName: "FoodOrdering",
      IndexName: "GSI1",
      KeyConditionExpression: "GSI1_PK = :pk and begins_with(GSI1_SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `Rest#${restId}`,
        ":sk": "Review#",
      },
    };
  }
  try {
    if (restId) {
      const getRestParams = {
        TableName: "FoodOrdering",
        Key: {
          PK: `Rest#${restId}`,
          SK: "RestDetails",
        },
      };
      const restResult = await documentClient.get(getRestParams).promise();
      if (!restResult.Item) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
    }

    if (userId) {
      const getUserParams = {
        TableName: "FoodOrdering",
        Key: {
          PK: `User#${userId}`,
          SK: "Profile",
        },
      };

      const userResult = await documentClient.get(getUserParams).promise();
      if (!userResult.Item) {
        return res.status(404).json({ message: "User not found" });
      }
    }
    const result = await documentClient.query(queryParams).promise();
    const reviews = result.Items || [];
    return res
      .status(200)
      .json({ reviews, message: "Reviews fetched successfully" });
  } catch (error) {
    console.error("Error querying reviews:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

module.exports = { createReview, getReviews };
