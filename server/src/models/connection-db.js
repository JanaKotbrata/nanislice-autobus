const { MongoClient } = require('mongodb');
const config = require("../../config/config.json");

let db;

async function connectToDb() {
    if (db) return db;

    const client = new MongoClient(config.db_uri);
    await client.connect();

    db = client.db(config.db_name);
    console.log(`Connected to: ${config.db_name}`);
    return db;
}

module.exports = connectToDb;
