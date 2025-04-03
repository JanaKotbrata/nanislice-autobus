const connectToDb = require('./connection-db');
const {ObjectId} = require('mongodb');
const collectionName = 'games';

async function getCollection() {
    const db = await connectToDb();
    return db.collection(collectionName);
}
async function list(collection, pageInfo = {pageIndex: 0, pageSize: 1000}, filter) {
    const list = await collection.find(filter).skip(pageInfo.pageIndex * pageInfo.pageSize).limit(pageInfo.pageSize).toArray();
    const totalCount = await collection.countDocuments();
    return {
        list,
        pageInfo: {...pageInfo, totalCount}
    }
}
async function createIndexes() {
    const collection = await getCollection();

    await collection.createIndex({code: 1}, {unique: true});
}

async function createGame(userData) {
    const collection = await getCollection();
    const result = await collection.insertOne(userData);
    return result.insertedId;
}


async function getGameById(id) {
    const collection = await getCollection();
    return collection.findOne({_id: new ObjectId(id)});
}

async function getGameByCode(code) {
    const collection = await getCollection();
    return collection.findOne({code});
}

async function listGame(pageInfo) {
    const collection = await getCollection();
    return await list(collection, pageInfo);
}

async function listGameByState(state, pageInfo) {
    const collection = await getCollection();
    return await list(collection, pageInfo, {state});
}

async function updateGame(id, updateData) {
    const collection = await getCollection();
    const result = await collection.updateOne(
        {_id: new ObjectId(id)},
        {$set: updateData}
    );
    return result.modifiedCount;
}

async function deleteGame(id) {
    const collection = await getCollection();

    const result = await collection.deleteOne({_id: new ObjectId(id)});
    return result.deletedCount;
}

module.exports = {
    createIndexes,
    createGame,
    getGameByCode,
    getGameById,
    updateGame,
    deleteGame,
    listGame,
    listGameByState
};
