const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const { v4 } = require("uuid");
const { dynamoDB, documentClient } = require("../database/db.js");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
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
        isAdmin: isAdmin,
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
      // result
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
        let payload = { userId: user[0].userId };

        const token = jwt.sign(payload, jwtSecretKey, {
          expiresIn: "1h",
        });
        return res.status(200).json({
          success: true,
          token: token,
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
    console.log(userId);

    const { name, password, phone, address } = req.body;

    const getUserParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: "Profile",
      },
    };

    const userResult = await documentClient.get(getUserParams).promise();
    console.log(userResult);

    if (!userResult.Item) {
      return res.status(404).json({ message: "User not found" });
    }

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
      updateExpression.push("address = :address");
      expressionValues[":address"] = address;
    }

    if (updateExpression.length === 0) {
      return res.status(400).json({ message: "No fields provided for update" });
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
      ReturnValues: "UPDATED_NEW",
    };

    const updateResult = await documentClient.update(updateParams).promise();

    console.log("Update Result:", updateResult);

    return res
      .status(200)
      .json({ message: "User profile updated successfully" });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ err: true, message: "Something went wrong" });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params.id;
  try {
    const userProfileParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: "Profile",
      },
    };

    const userProfile = await dynamoDB.get(userProfileParams).promise();
    if (!userProfile.Item) {
      return res.status(404).json({ message: "User not found" });
    }

    const activeOrdersParams = {
      TableName: "FoodOrdering",
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": `User#${userId}`,
        ":skPrefix": "Order#",
      },
      FilterExpression: "NOT (#status IN (:completed, :cancelled))",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":completed": "Completed",
        ":cancelled": "Cancelled",
      },
    };

    const activeOrders = await dynamoDB.query(activeOrdersParams).promise();
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
      return dynamoDB.update(updateOrderParams).promise();
    });

    const reviewQueryParams = {
      TableName: "YourTableName",
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": `User#${userId}`,
        ":skPrefix": "Review#",
      },
    };

    const reviews = await dynamoDB.query(reviewQueryParams).promise();
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
      return dynamoDB.update(updateReviewParams).promise();
    });

    // Delete user's cart
    const deleteCartParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: "Cart",
      },
    };

    const deleteCartPromise = dynamoDB.delete(deleteCartParams).promise();

    // Delete user's profile
    const deleteProfileParams = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: "Profile",
      },
    };

    const deleteProfilePromise = dynamoDB.delete(deleteProfileParams).promise();

    await Promise.all([
      ...orderUpdatePromises,
      ...reviewUpdatePromises,
      deleteCartPromise,
      deleteProfilePromise,
    ]);

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const params = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${id}`,
        SK: "Profile",
      },
    };
    const userResult = await documentClient.get(params).promise();
    if (!userResult.Item) {
      res.status(404).json({ message: "User not found" });
    }
    const { userId, name, email, phone, age, address } = userResult.Item;
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
    const params = {
      TableName: "FoodOrdering",
      KeyConditionExpression: "PK = :pk AND SK = :sk",
      ExpressionAttributeValues: {
        ":pk": `User#${id}`,
        ":sk": "Cart",
      },
    };
    const result = await documentClient.query(params).promise();
    console.log("item bahar", result.Items);
    const cartItems = result.Items[0].items.map((item) =>
      // console.log("item andr",item)
      ({
        dishName: item.dishName,
        quantity: item.quantity,
        price: item.price,
        restId: item.restId,
        restName: item.restName,
      })
    );
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return res.status(200).json({
      id,
      cartItems,
      totalAmount,
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
  console.log(userId, item);

  try {
    // const getUserParams = {
    //   TableName: "FoodOrdering",
    //   Key: {
    //     PK: `User#${userId}`,
    //     SK: "Profile",
    //   },
    // };

    // const userResult = await documentClient.get(getUserParams).promise();
    // console.log(userResult);

    // if (!userResult.Item) {
    //   return res.status(404).json({ message: "User not found" });
    // }
    const params = {
      TableName: "FoodOrdering",
      Key: {
        PK: `User#${userId}`,
        SK: `Cart`,
      },
    };

    const existingCart = await documentClient.get(params).promise();
    console.log("existing cart", existingCart.Item);
    let cartItems = existingCart.Item?.items || [];

    if (action === "add") {
      const existingItem = cartItems.find(
        (cartItem) => cartItem.dishName === item.dishName
      );
      console.log("existing", existingItem);

      if (existingItem) {
        cartItems = cartItems.map((cartItem) =>
          cartItem.name === item.name
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      } else {
        cartItems.push(item);
      }
    } else if (action === "remove") {
      cartItems = cartItems
        .map((cartItem) => {
          if (cartItem.name === item.name) {
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

    const updateParams = {
      ...params,
      UpdateExpression: "SET #items = :items",
      ExpressionAttributeNames: {
        "#items": "items",
      },
      ExpressionAttributeValues: {
        ":items": cartItems,
      },
      ReturnValues: "ALL_NEW",
    };

    const updateResult = await documentClient.update(updateParams).promise();
    console.log(updateResult.Attributes.items);

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
