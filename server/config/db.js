require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDB = new AWS.DynamoDB({
  endpoint: process.env.AWS_ENDPOINT,
});

const documentClient = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.AWS_ENDPOINT,
});


const createTable = async (params) => {
  dynamoDB.createTable(params, (err, data) => {
    if (err) {
      console.error("Error creating table:", err);
    } else {
      console.log("Table created:", data);
    }
  });
};

const deleteTable = async (tableName) => {
  const params = {
    TableName: tableName,
  };

  try {
    const result = await dynamoDB.deleteTable(params).promise();
    console.log(`Table ${tableName} deleted successfully.`);
    console.log("Result:", result);
  } catch (error) {
    console.error(`Failed to delete table ${tableName}.`, error);
  }
};


module.exports = { dynamoDB, documentClient, createTable, deleteTable };
