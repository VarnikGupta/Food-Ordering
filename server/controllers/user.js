const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { v4 } = require("uuid");
const { dynamoDB, documentClient } = require("../config/db.js");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const { redisCalls } = require("../services/cache.js");
dotenv.config();

const validateBody = validationResult.withDefaults({
  formatter: (err) => {
    return {
      err: true,
      message: err.msg,
    };
  },
});

const registerUser = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(400).json({ err, message });
  }
  const userId = v4();
  const { name, email, password, phone, address, isAdmin } = req.body;
  const emailExists = await checkEmailExistence(email);
  if (emailExists.length > 0) {
    return res.status(409).json({ err: true, message: "Email already exists" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const params = {
      TableName: "FoodOrdering",
      Item: {
        PK: `User#${userId}`,
        SK: "Profile",
        GSI1_PK: `UserEmail#${email}`,
        GSI1_SK: "Email",
        userId: userId,
        name: name,
        email: email,
        phone: phone,
        address: [address],
        password: hashedPassword,
        isAdmin: isAdmin || false,
      },
    };
    const cartParams = {
      TableName: "FoodOrdering",
      Item: {
        PK: `User#${userId}`,
        SK: "Cart",
        UserId: userId,
        Items: [],
      },
    };
    await documentClient.put(params).promise();
    await documentClient.put(cartParams).promise();
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId,
    });
  } catch (err) {
    console.error("Error registering new user: ", err);
    return res.status(500).json({
      err: true,
      message: "Internal server error",
    });
  }
};

const checkEmailExistence = async (email) => {
  const params = {
    TableName: "FoodOrdering",
    IndexName: "GSI1",
    KeyConditionExpression: "GSI1_PK = :email",
    ExpressionAttributeValues: {
      ":email": `UserEmail#${email}`,
    },
  };

  try {
    const result = await documentClient.query(params).promise();
    console.log("result is", result);
    return result.Items;
  } catch (err) {
    console.error("Error checking email existence:", err);
    throw err;
  }
};

const login = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  }
  const { email, password } = req.body;
  try {
    let user = await checkEmailExistence(email);
    console.log("user is", user);
    if (user.length > 0) {
      const isMatch = await bcrypt.compare(password, user[0].password);
      if (isMatch) {
        let jwtSecretKey = process.env.JWT_SECRET_KEY;
        console.log(jwtSecretKey);
        let payload = {
          userId: user[0].userId,
          isAdmin: user[0].isAdmin || false,
        };

        const token = jwt.sign(payload, jwtSecretKey, {
          expiresIn: "1h",
        });
        await redisCalls("user", "set", user[0].userId, 3600, {
          name: user[0].name,
          email: user[0].email,
          address: user[0].address,
        });
        return res.status(200).json({
          success: true,
          user: {
            _id: user[0].userId,
            email: user[0].email,
            name: user[0].name,
            token: token,
          },
          message: "User logged in successfully",
        });
      } else {
        return res.status(401).json({ err: true, message: "Wrong password" });
      }
    } else {
      return res
        .status(404)
        .json({ err: true, message: "Email not registered" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: true, message: "Something went wrong" });
  }
};

const updateUserDetails = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(400).json({ err, message });
  }

  try {
    const userId = req.params.id;

    const { name, password, phone, address } = req.body;

    const updateExpression = [];
    const expressionValues = {};
    const expressionNames = {};

    if (name) {
      updateExpression.push("#name = :name");
      expressionValues[":name"] = name;
      expressionNames["#name"] = "name";
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateExpression.push("password = :password");
      expressionValues[":password"] = hashedPassword;
    }

    if (phone) {
      updateExpression.push("phone = :phone");
      expressionValues[":phone"] = phone;
    }

    if (address) {
      updateExpression.push("#address = :address");
      expressionValues[":address"] = address;
      expressionNames["#address"] = "address";
    }

    const updateParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: "Profile",
      },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeValues: expressionValues,
      ExpressionAttributeNames: expressionNames,
      ConditionExpression: "attribute_exists(PK)",
      ReturnValues: "UPDATED_NEW",
    };

    const updateResult = await documentClient.update(updateParams).promise();

    const ttl = await redisCalls(null, "ttl", `user:${userId}`);

    const existingCache = await redisCalls("hash", "get", `user:${userId}`);

    const existingAddress = existingCache?.address
      ? JSON.parse(existingCache.address)
      : [];

    const updatedAddress = address
      ? [
          ...existingAddress,
          ...address.filter((item) => !existingAddress.includes(item)),
        ]
      : existingAddress;

    await redisCalls("hash", "set", `user:${userId}`, ttl, {
      ...(name && { name: name }),
      ...(phone && { phone: phone }),
      ...(updatedAddress.length && { address: JSON.stringify(updatedAddress) }),
    });

    if (name) {
      const queryParams = {
        TableName: "FoodOrdering",
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": `User#${userId}`,
          ":sk": "Review#",
        },
      };

      const reviews = await documentClient.query(queryParams).promise();

      const updateReviewPromises = reviews.Items.map((review) => {
        const updateReviewParams = {
          TableName: "FoodOrdering",
          Key: {
            PK: `User#${userId}`,
            SK: review.SK,
          },
          UpdateExpression: "SET userName = :userName",
          ExpressionAttributeValues: {
            ":userName": name,
          },
        };
        return documentClient.update(updateReviewParams).promise();
      });

      await Promise.all(updateReviewPromises);
    }
    const reviewCacheKey = `reviews:user#${userId}`;
    await redisCalls("string", "del", reviewCacheKey);

    const result = updateResult.Attributes;

    return res
      .status(200)
      .json({ message: "User profile updated successfully", result });
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      return res.status(404).json({ message: "User profile not found." });
    }
    console.error("Error updating user profile:", error);
    return res.status(500).json({ err: true, message: "Something went wrong" });
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const activeOrdersParams = {
      TableName: "FoodOrdering",
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": `User#${userId}`,
        ":skPrefix": "Order#",
        ":completed": "Completed",
        ":cancelled": "Cancelled",
      },
      FilterExpression: "NOT (#status IN (:completed, :cancelled))",
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };

    const activeOrders = await documentClient
      .query(activeOrdersParams)
      .promise();
    if (activeOrders.Items.length > 0) {
      return res.status(400).json({
        message: "Active orders prevent user deletion",
      });
    }

    const orderUpdatePromises = activeOrders.Items.map((order) => {
      const updateOrderParams = {
        TableName: "FoodOrdering",
        Key: {
          PK: `User#${userId}`,
          SK: `Order#${order.OrderId}`,
        },
        UpdateExpression: "SET #userDeleted = :deleted",
        ExpressionAttributeNames: {
          "#userDeleted": "userDeleted",
        },
        ExpressionAttributeValues: {
          ":deleted": true,
        },
      };
      return documentClient.update(updateOrderParams).promise();
    });

    const reviewQueryParams = {
      TableName: "FoodOrdering",
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": `User#${userId}`,
        ":skPrefix": "Review#",
      },
    };

    const reviews = await documentClient.query(reviewQueryParams).promise();

    const reviewUpdatePromises = reviews.Items.map((review) => {
      const updateReviewParams = {
        TableName: "FoodOrdering",
        Key: {
          PK: `User#${userId}`,
          SK: review.SK,
        },
        UpdateExpression: "SET #userDeleted = :deleted",
        ExpressionAttributeNames: {
          "#userDeleted": "userDeleted",
        },
        ExpressionAttributeValues: {
          ":deleted": true,
        },
      };
      return documentClient.update(updateReviewParams).promise();
    });

    const deleteCartParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: "Cart",
      },
      ConditionExpression: "attribute_exists(PK)",
    };

    const deleteCartPromise = documentClient.delete(deleteCartParams).promise();

    const deleteProfileParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: "Profile",
      },
      ConditionExpression: "attribute_exists(PK)",
    };

    const deleteProfilePromise = documentClient
      .delete(deleteProfileParams)
      .promise();

    await Promise.all([
      ...orderUpdatePromises,
      ...reviewUpdatePromises,
      deleteCartPromise,
      deleteProfilePromise,
    ]);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      return res.status(404).json({ message: "User not found." });
    }
    console.error("Error deleting user:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const getCache = await redisCalls("hash", "get", `user:${id}`);
    if (getCache) {
      getCache.address = JSON.parse(getCache.address);
      return res.json({
        message: "User profile fetched successfully from cache",
        user: getCache,
      });
    }
    const params = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${id}`,
        SK: "Profile",
      },
    };
    const userResult = await documentClient.get(params).promise();
    if (!userResult.Item) {
      return res.status(404).json({ message: "User not found" });
    }
    const { userId, name, email, phone, age, address } = userResult.Item;
    await redisCalls("hash", "set", `user:${id}`, 3600, {
      name: name,
      email: email,
      ...(age && { age: age }),
      ...(phone && { phone: phone }),
      ...(address && { address: JSON.stringify(address) }),
    });
    return res.json({
      message: "User profile fetched successfully",
      user: { userId, name, email, phone, age, address },
    });
  } catch (err) {
    console.error("Error retrieving user profile:", err);
    return res.status(500).json({ err: true, message: err.message });
  }
};

const getUserCart = async (req, res) => {
  const id = req.params.id;
  try {
    const getUser = await redisCalls("hash", "get", `user:${id}`);
    if (!getUser) {
      const getUserParams = {
        TableName: "FoodOrdering",
        Key: {
          PK: `User#${id}`,
          SK: "Profile",
        },
      };

      const userResult = await documentClient.get(getUserParams).promise();

      if (!userResult.Item) {
        return res.status(404).json({ message: "User not found" });
      }
    }
    const getCache = await redisCalls("hash", "get", `cart:${id}`);
    if (getCache) {
      getCache.cartItems = JSON.parse(getCache.cartItems);
      return res.json({
        ...getCache,
      });
    }
    const params = {
      TableName: "FoodOrdering",
      KeyConditionExpression: "PK = :pk AND SK = :sk",
      ExpressionAttributeValues: {
        ":pk": `User#${id}`,
        ":sk": "Cart",
      },
    };
    const result = await documentClient.query(params).promise();
    const item = result.Items[0].items;
    console.log(item);
    const cartItems =
      item && item.length > 0
        ? item.map((item) => ({
            dishName: item.dishName,
            quantity: item.quantity,
            price: item.price,
            restId: item.restId,
            restName: item.restName,
          }))
        : [];
    await redisCalls("hash", "set", `cart:${id}`, 3600, {
      id: item[0].restId,
      ...(cartItems && { cartItems: JSON.stringify(cartItems) }),
    });
    return res.status(200).json({
      id: item[0].restId,
      cartItems,
    });
  } catch (err) {
    console.error("Error fetching user cart:", err);
    return res.status(500).json({ err: true, message: err.message });
  }
};

const updateUserCart = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(400).json({ err, message });
  }
  const userId = req.params.id;
  const { action, item } = req.body;

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
      return res.status(404).json({ message: "User not found" });
    }
    const params = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: `Cart`,
      },
    };
    let cartData = await redisCalls("hash", "get", `cart:${userId}`);
    console.log(cartData)
    let cartItems = [];
    let currentRestId = null;

    if (cartData) {
      cartItems = JSON.parse(cartData.cartItems) || [];
      currentRestId = cartData.id || null;
    } else {
      const existingCart = await documentClient.get(params).promise();
      cartItems = existingCart.Item?.items || [];
      currentRestId = existingCart.Item?.restId || null;
    }
    if (action === "remove" && cartItems.length === 0) {
      return res.status(400).json({
        message: "Cannot remove items from an empty cart",
      });
    }
    if (cartItems.length === 0) {
      cartItems.push(item);
      currentRestId = item.restId;
    } else {
      if (currentRestId === item.restId) {
        if (action === "add") {
          const existingItem = cartItems.find(
            (cartItem) => cartItem.dishName === item.dishName
          );

          if (existingItem) {
            cartItems = cartItems.map((cartItem) =>
              cartItem.dishName === item.dishName
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem
            );
          } else {
            cartItems.push(item);
          }
        } else if (action === "remove") {
          cartItems = cartItems
            .map((cartItem) => {
              if (cartItem.dishName === item.dishName) {
                const updatedQuantity = cartItem.quantity - item.quantity;
                if (updatedQuantity > 0) {
                  return { ...cartItem, quantity: updatedQuantity };
                }
                return null;
              }
              return cartItem;
            })
            .filter(Boolean);
        }
      } else {
        cartItems = [item];
        currentRestId = item.restId;
      }
    }

    const updateParams = {
      ...params,
      UpdateExpression: "SET #items = :items, restId = :restId",
      ExpressionAttributeNames: {
        "#items": "items",
      },
      ExpressionAttributeValues: {
        ":items": cartItems,
        ":restId": currentRestId,
      },
      ReturnValues: "ALL_NEW",
    };

    const updateResult = await documentClient.update(updateParams).promise();

    const ttl = await redisCalls(null, "ttl", `cart:${userId}`);
    await redisCalls("hash", "set", `cart:${userId}`, ttl, {
      id: userId,
      cartItems: JSON.stringify(cartItems),
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: updateResult.Attributes.items,
    });
  } catch (err) {
    console.error("Error updating cart: ", err);
    return res.status(500).json({
      err: true,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  checkEmailExistence,
  login,
  updateUserDetails,
  deleteUser,
  getUserById,
  getUserCart,
  updateUserCart,
};
