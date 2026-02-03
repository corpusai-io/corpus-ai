const { DynamoDBClient, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  endpoint: "http://localhost:8000",
  region: "eu-north-1",
  credentials: { accessKeyId: "fake", secretAccessKey: "fake" }
});

const command = new ListTablesCommand({});

client.send(command)
  .then((data) => {
    console.log("Existing Tables:", data.TableNames);
  })
  .catch((err) => console.error("Error:", err));