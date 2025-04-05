const { MongoClient } = require('mongodb');
const config = require("../../config/config.json");

let db;

async function connectToDb() {
    if (db) return db;
    //ošetření proti znovu připojení do db
    db = new Promise(async (resolve, reject) => {
        const client = new MongoClient(config.db_uri);
        await client.connect();

        const selectedDb = client.db(config.db_name);
        console.log(`Connected to: ${config.db_name}`);
        resolve(selectedDb);
    })

    return db;
}

module.exports = connectToDb;
