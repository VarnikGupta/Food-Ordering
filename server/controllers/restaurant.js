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

const addRestaurant = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  }
  const restId = v4();
  const { name, location, contact } = req.body;
  try {
    const params = {
      TableName: "FoodOrdering",
      Item: {
        PK: `Rest#${restId}`,
        SK: "RestDetails",
        GSI1_PK: `Restaurant`,
        GSI1_SK: `Rest#${restId}`,
        restId: restId,
        name: name.toLowerCase(),
        contact: contact,
        location: location,
        rating: 0,
        ratingCount: 0,
      },
    };

    await documentClient.put(params).promise();
    return res.status(201).json({
      success: true,
      message: "Restaurant registered successfully",
      restId,
    });
  } catch (err) {
    console.error("Error registering new restaurant: ", err);
    return res.status(500).json({
      err: true,
      message: "Internal server error",
    });
  }
};

const getAllrestaurants = async (req, res) => {
  try {
    const params = {
      TableName: "FoodOrdering",
      IndexName: "GSI1",
      KeyConditionExpression: "#pk = :pk AND begins_with(#sk,:sk)",
      ExpressionAttributeNames: {
        "#pk": "GSI1_PK",
        "#sk": "GSI1_SK",
      },
      ExpressionAttributeValues: {
        ":pk": "Restaurant",
        ":sk": "Rest#",
      },
    };

    // Use `query` instead of `quer`
    const result = await documentClient.query(params).promise();

    // Check if any restaurants are found
    if (!result.Items || result.Items.length === 0) {
      return res.status(404).json({ message: "No Restaurants found" });
    }

    // Extract and map the result
    const restaurants = result.Items.map(({ restId, name, location, contact, rating, ratingCount }) => ({
      restId,
      name,
      location,
      contact,
      rating,
      ratingCount,
    }));

    return res.json({
      message: "Restaurants fetched successfully",
      restaurants, // Return the array of restaurants
    });
  } catch (err) {
    console.error("Error retrieving restaurants:", err);
    return res.status(500).json({ err: true, message: err.message });
  }
};


const getRestaurantById = async (req, res) => {
  const id = req.params.id;
  try {
    const params = {
      TableName: "FoodOrdering",
      Key: {
        PK: `Rest#${id}`,
        SK: "RestDetails",
      },
    };
    const result = await documentClient.get(params).promise();
    if (!result.Item) {
      res.status(404).json({ message: "Restaurant not found" });
    }
    const { restId, name, location, contact, rating, ratingCount } =
      result.Item;
    return res.json({
      message: "Restaurant profile fetched successfully",
      restaurant: { restId, name, location, contact, rating, ratingCount },
    });
  } catch (err) {
    console.error("Error retrieving restaurant profile:", err);
    return res.status(500).json({ err: true, message: err.message });
  }
};

const getMenu = async (req, res) => {
  const restId = req.params.id;
  try {
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
    console.log("rest profile results", restaurantResult);
    if (!restaurantResult.Item) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const params = {
      TableName: "FoodOrdering",
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `Rest#${restId}`,
        ":sk": "Menu#",
      },
    };

    const existingMenuResult = await documentClient.query(params).promise();
    console.log(existingMenuResult);
    const menu = existingMenuResult.Items.map((item) => ({
      dishName: item.dishName,
      cuisine: item.cuisine,
      cost: item.cost,
      category: item.category,
    }));

    return res.status(200).json({
      success: true,
      name: restaurantResult.Item.name,
      menu,
      message: "Menu fetched successfully",
    });
  } catch (err) {
    console.error("Error fetching menu: ", err);
    return res.status(500).json({
      err: true,
      message: "Internal server error",
    });
  }
};

const updateMenu = async (req, res) => {
  const errors = validateBody(req);
  if (!errors.isEmpty()) {
    const { err, message } = errors.array({ onlyFirstError: true })[0];
    return res.status(422).json({ err, message });
  }
  const restId = req.params.id;
  const { menuItems } = req.body;
  try {
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
    const params = {
      TableName: "FoodOrdering",
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :sk)",
      ExpressionAttributeValues: {
        ":pk": `Rest#${restId}`,
        ":sk": "Menu#",
      },
    };

    const existingMenuResult = await documentClient.query(params).promise();
    console.log("existing", existingMenuResult);
    const existingMenu = existingMenuResult.Items || [];

    const existingMenuMap = existingMenu.reduce((map, item) => {
      map[item.DishName] = item;
      return map;
    }, {});
    const putRequests = menuItems.map((menuItem) => {
      const { dishName, cuisine, category, cost } = menuItem;
      const existingItem = existingMenuMap[dishName];
      const updatedItem = {
        PK: `Rest#${restId}`,
        SK: `Menu#${dishName.toLowerCase()}`,
        GSI1_PK: `Dish#${dishName.toLowerCase()}`,
        GSI1_SK: `Rest#${restId}`,
        restId: restId,
        restName: result.Item.name,
        dishName: dishName.toLowerCase(),
        cuisine: cuisine.toLowerCase() || existingItem?.cuisine,
        category: category.toLowerCase() || existingItem?.category,
        cost: cost || existingItem?.Cost,
      };

      return {
        PutRequest: {
          Item: updatedItem,
        },
      };
    });

    const batchWriteParams = {
      RequestItems: {
        FoodOrdering: putRequests,
      },
    };

    let resultt = await documentClient.batchWrite(batchWriteParams).promise();
    console.log(resultt);

    return res.status(200).json({
      restaurantId: restId,
      message: "Menu updated successfully.",
      menuItems,
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

module.exports = {
  addRestaurant,
  getAllrestaurants,
  getRestaurantById,
  getMenu,
  updateMenu,
};
