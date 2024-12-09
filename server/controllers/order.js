const { validationResult } = require("express-validator");
const { v4 } = require("uuid");
const { documentClient } = require("../config/db.js");
const { redisCalls } = require("../services/cache.js");

const validateBody = validationResult.withDefaults({
  formatter: (err) => {
    return {
      err: true,
      message: err.msg,
    };
  },
});

const getOrderHistory = async (req, res) => {
  const { userId, restId, status, favourite } = req.query;

  try {
    let cacheKey = "orderHistory:";
    if (userId) {
      cacheKey += `userId:${userId}`;
    }
    if (restId) {
      cacheKey += `restId:${restId}`;
    }
    if (status) {
      cacheKey += `:status:${status}`;
    }
    if (favourite) {
      cacheKey += `:favourite:${favourite}`;
    }

    const cachedOrderHistory = await redisCalls(
      "string",
      "get",
      cacheKey
    );
    if (cachedOrderHistory) {
      return res.status(200).json({
        message: "Order History fetched successfully from cache",
        orderHistory: JSON.parse(cachedOrderHistory),
      });
    }

    let queryParams = {};
    let filterExpressions = [];
    let expressionAttributeValues = {};
    let expressionAttributeNames = {};

    if (userId) {
      const getUser = await redisCalls("hash", "get", userId);
      if (!getUser) {
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
      queryParams = {
        TableName: "FoodOrdering",
        IndexName: "LSI1",
        KeyConditionExpression: "PK = :pk AND begins_with(LSI1_SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `User#${userId}`,
          ":sk": "Order#",
        },
      };
      if (favourite === "true") {
        filterExpressions.push("#isfavourite = :isFavourite");
        expressionAttributeValues[":isFavourite"] = true;
        expressionAttributeNames["#isfavourite"] = "isfavourite";
      }
    } else if (restId) {
      const getRest = await redisCalls("hash", "get", userId);
      if (!getRest) {
        const getRestaurantParams = {
          TableName: "FoodOrdering",
          Key: {
            PK: `Rest#${restId}`,
            SK: "RestDetails",
          },
        };
        const result = await documentClient.get(getRestaurantParams).promise();
        if (!result.Item) {
          return res.status(404).json({ message: "Restaurant not found" });
        }
      }
      queryParams = {
        TableName: "FoodOrdering",
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1_PK = :pk AND begins_with(GSI1_SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `Rest#${restId}`,
          ":sk": "Order#",
        },
      };
    }
    if (status) {
      filterExpressions.push("#status = :status");
      expressionAttributeValues[":status"] = status;
      expressionAttributeNames["#status"] = "status";
    }

    if (filterExpressions.length > 0) {
      queryParams.FilterExpression = filterExpressions.join(" AND ");
      queryParams.ExpressionAttributeValues = {
        ...queryParams.ExpressionAttributeValues,
        ...expressionAttributeValues,
      };
      queryParams.ExpressionAttributeNames = expressionAttributeNames;
    }

    const result = await documentClient.query(queryParams).promise();
    const orderHistory = result.Items.map((order) => ({
      orderId: order.orderId,
      userId: order.userId,
      orderDate: order.orderDate,
      status: order.status,
      restName: order.restName,
      restId: order.restId,
      deliveryAddress: order.deliveryAddress,
      isFavourite: order.isfavourite,
      totalAmount: order.amount,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        dishName: item.dishName,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    await redisCalls(
      "string",
      "set",
      cacheKey,
      3600,
      JSON.stringify(orderHistory)
    );

    return res.status(200).json({
      message: "Order History fetched successfully",
      orderHistory,
    });
  } catch (err) {
    console.error("Error fetching order history:", err);
    return res.status(500).json({ err: true, message: err.message });
  }
};

const getOrderDetails = async (req, res) => {
  const { userId, orderId } = req.params;
  try {
    const getUserParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: "Profile",
      },
    };

    const userResult = await documentClient.get(getUserParams).promise();
    if (!userResult.Item) {
      res.status(404).json({ message: "User not found" });
    }
    const params = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: `Order#${orderId}`,
      },
    };

    const result = await documentClient.get(params).promise();

    if (!result.Item) {
      return res.status(400).json({ message: "Order not found" });
    }
    const orderDetails = {
      orderId: result.Item.orderId,
      userId: result.Item.userId,
      orderDate: result.Item.orderDate,
      status: result.Item.status,
      restName: result.Item.restName,
      restId: result.Item.restId,
      deliveryAddress: result.Item.deliveryAddress,
      isFavourite: result.Item.isFavourite,
      totalAmount: result.Item.amount,
      items: result.Item.items.map((item) => ({
        dishName: item.dishName,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    return res.json({
      message: "Order fetched successfully",
      order: orderDetails,
    });
  } catch (err) {
    console.error("Error fetching order details:", err);
    return res.status(500).json({ err: true, message: err.message });
  }
};

const createOrder = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  }
  const orderId = v4();
  const { userId, amount, restId, restName, items, deliveryAddress } = req.body;
  const createdAt = Math.floor(Date.now() / 1000);

  const userQueryParams = {
    TableName: "FoodOrdering",
    Key: {
      PK: `User#${userId}`,
      SK: "Profile",
    },
  };
  const userResult = await documentClient.get(userQueryParams).promise();
  if (!userResult.Item) {
    return res.status(400).json({ message: "User not found" });
  }

  const restaurantQueryParams = {
    TableName: "FoodOrdering",
    Key: {
      PK: `Rest#${restId}`,
      SK: "RestDetails",
    },
  };
  const restaurantResult = await documentClient
    .get(restaurantQueryParams)
    .promise();
  if (!restaurantResult.Item) {
    return res.status(400).json({ message: "Restaurant not found" });
  }

  try {
    const params = {
      TableName: "FoodOrdering",
      Item: {
        PK: `User#${userId}`,
        SK: `Order#${orderId}`,
        GSI1_PK: `Rest#${restId}`,
        GSI1_SK: `Order#${orderId}`,
        LSI1_SK: `Order#${createdAt}`,
        userId: userId,
        orderId: orderId,
        createdAt: createdAt,
        status: "Preparing",
        amount: amount,
        restId: restId,
        restName: restName,
        items: items,
        isfavourite: false,
        deliveryAddress: deliveryAddress,
      },
    };

    const result = await documentClient.put(params).promise();
    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId,
    });
  } catch (err) {
    console.error("Error creating new order: ", err);
    return res.status(500).json({
      err: true,
      message: "Internal server error",
    });
  }
};

const updateOrderDetails = async (req, res) => {
  const { userId, orderId } = req.params;
  const { status, favourite } = req.body;

  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  }

  const userQueryParams = {
    TableName: "FoodOrdering",
    Key: {
      PK: `User#${userId}`,
      SK: "Profile",
    },
  };
  const userResult = await documentClient.get(userQueryParams).promise();
  if (!userResult.Item) {
    return res.status(400).json({ message: "User not found" });
  }

  const orderQueryParams = {
    TableName: "FoodOrdering",
    Key: {
      PK: `User#${userId}`,
      SK: `Order#${orderId}`,
    },
  };
  const orderResult = await documentClient.get(orderQueryParams).promise();
  if (!orderResult.Item) {
    return res.status(400).json({ message: "Order not found" });
  }

  try {
    let updateExpression = [];
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};

    if (status) {
      updateExpression.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = status;
    }

    if (favourite !== undefined) {
      updateExpression.push("#isFavourite = :isFavourite");
      expressionAttributeNames["#isFavourite"] = "isfavourite";
      expressionAttributeValues[":isFavourite"] = favourite;
    }
    const params = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: `Order#${orderId}`,
      },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };

    const updatedResult = await documentClient.update(params).promise();
    let cacheKey = "orderHistory:";
    if (userId) {
      cacheKey += `userId:${userId}`;
    }
    if (favourite) {
      cacheKey += `:favourite:${favourite}`;
    }
    await redisCalls("string", "del", cacheKey);

    return res.status(200).json({
      orderId,
      updatedDetails: updatedResult.Attributes,
      message: "Order status updated successfully",
    });
  } catch (err) {
    console.error("Error updating order status: ", err);
    return res.status(500).json({
      err: true,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createOrder,
  getOrderHistory,
  getOrderDetails,
  updateOrderDetails,
};
