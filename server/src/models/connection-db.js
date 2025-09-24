const { MongoClient } = require("mongodb");
const config = require("../../config/config.json");

let db;
let client;
const uri = config.db_uri;

async function connectToDb() {
  if (db) return db;
  // fill db variable so everyone gets the same connection one it is ready
  db = new Promise(async (res) => {
    client = new MongoClient(uri);
    await client.connect();
    res(client.db(config.db_name)); // resolve the db promise when connected
    console.log(`Connected to: ${config.db_name}`);
  });
  return db;
}

module.exports = {
  connectToDb,
};
