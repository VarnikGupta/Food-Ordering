const { validationResult } = require("express-validator");
const { v4 } = require("uuid");
const { documentClient } = require("../database/db.js");

const validateBody = validationResult.withDefaults({
  formatter: (err) => {
    return {
      err: true,
      message: err.msg,
    };
  },
});

const getOrderHistory = async (req, res) => {
  const { userId } = req.params;
  try {
    const getUserParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: "Profile",
      },
    };

    const userResult = await dynamoDB.get(getUserParams).promise();
    if (!userResult.Item) {
      res.status(404).json({ message: "User not found" });
    }
    const getOrderHistoryParams = {
      TableName: "FoodOrdering",
      IndexName: "LSI1",
      KeyConditionExpression: "PK = :pk AND LSI1_SK = begins_with(:sk)",
      ExpressionAttributeValues: {
        ":pk": `User#${userId}`,
        ":sk": "Order#",
      },
    };
    const result = await documentClient.query(getOrderHistoryParams).promise();
    const orderHistory = result.Items.map((order) => ({
      orderId: order.orderId,
      userId: order.userId,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName,
      orderDate: order.orderDate,
      status: order.status,
      restName: order.restName,
      restId: restId,
      deliveryAddress: order.deliveryAddress,
      isFavourite: order.isFavourite,
      totalAmount: order.totalAmount,
      items: order.items.map((item) => ({
        dishName: item.dishName,
        quantity: item.quantity,
        price: item.price,
      })),
    }));

    return res.status(200).json({
      message: "Order History fetched successfully",
      orderHistory,
    });
  } catch (err) {
    console.error("Error fetching order history:", error);
    return res.status(500).json({ err: true, message: err.message });
  }
};

const getOrderDetails = async (req, res) => {
  const { userId, orderId } = req.params;
  try {
    const params = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: `Order#${orderId}`,
      },
    };

    const result = await dynamoDB.get(params).promise();

    if (!result.Item) {
      res.status(400).json({ message: "Order not found" });
    }
    return res.json({
      message: "Order fetched successfully",
      user: result.Item,
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
  const userResult = await dynamoDB.get(userQueryParams).promise();
  if (!userResult.Item) {
    res.status(400).json({ message: "User not found" });
  }

  const restaurantQueryParams = {
    TableName: "FoodOrdering",
    Key: {
      PK: `Rest#${restaurantId}`,
      SK: "RestDetails",
    },
  };
  const restaurantResult = await dynamoDB.get(restaurantQueryParams).promise();
  if (!restaurantResult.Item) {
    res.status(400).json({ message: "Restaurant not found" });
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

    await documentClient.put(params).promise();
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

const updateOrderStatus = async (req, res) => {
  const { userId, orderId } = req.params;
  const { status } = req.body;

  const errors = validationResult(req);
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
  const userResult = await dynamoDB.get(userQueryParams).promise();
  if (!userResult.Item) {
    res.status(400).json({ message: "User not found" });
  }

  const orderQueryParams = {
    TableName: "FoodOrdering",
    Key: {
      PK: `User#${userId}`,
      SK: `Order#${orderId}`,
    },
  };
  const orderResult = await dynamoDB.get(orderQueryParams).promise();
  if (!orderResult.Item) {
    res.status(400).json({ message: "Order not found" });
  }

  try {
    const params = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: `Order#${orderId}`,
      },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
      ReturnValues: "ALL_NEW",
    };

    const result = await documentClient.update(params).promise();

    return res.status(200).json({
      orderId: orderId,
      status: status,
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
  updateOrderStatus,
};
