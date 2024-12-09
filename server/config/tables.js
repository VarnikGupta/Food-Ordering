const { createTable } = require("./db");

const params = {
  TableName: "FoodOrdering",
  AttributeDefinitions: [
    { AttributeName: "PK", AttributeType: "S" },
    { AttributeName: "SK", AttributeType: "S" },
    { AttributeName: "GSI1_PK", AttributeType: "S" }, 
    { AttributeName: "GSI1_SK", AttributeType: "S" }, 
    { AttributeName: "LSI1_SK", AttributeType: "S" }, 
  ],
  KeySchema: [
    { AttributeName: "PK", KeyType: "HASH" },
    { AttributeName: "SK", KeyType: "RANGE" },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: "GSI1",
      KeySchema: [
        { AttributeName: "GSI1_PK", KeyType: "HASH" },
        { AttributeName: "GSI1_SK", KeyType: "RANGE" },
      ],
      Projection: {
        ProjectionType: "ALL",
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    },
  ],
  LocalSecondaryIndexes: [
    {
      IndexName: "LSI1",
      KeySchema: [
        { AttributeName: "PK", KeyType: "HASH" }, 
        { AttributeName: "LSI1_SK", KeyType: "RANGE" }, 
      ],
      Projection: {
        ProjectionType: "ALL", 
      },
    },
  ],
};


// (async () => {
//   console.log("Creating 'Users' table...");
//   await createTable(params);
// })();

async function create() {
  console.log("Creating 'Users' table...");
  await createTable(params);
}


// Call the function with your table name


module.exports = { create };
