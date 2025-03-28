const connectToDb = require('./connection-db');
const {ObjectId} = require('mongodb');
const collectionName = 'users';

async function getCollection() {
    const db = await connectToDb();
    return db.collection(collectionName);
}

async function createIndexes() {
    const collection = await getCollection();

    await collection.createIndex({email: 1}, {unique: true});
    await collection.createIndex({googleId: 1}, {unique: true});
    await collection.createIndex({discordId: 1}, {unique: true});
}

async function createUser(userData) {
    const collection = await getCollection();
    const result = await collection.insertOne(userData);
    return result.insertedId;
}


async function getUserById(id) {
    const collection = await getCollection();
    return collection.findOne({_id: new ObjectId(id)});
}

async function getUsersByGoogleId(googleId) {
    const collection = await getCollection();
    return collection.findOne({googleId});
}

async function getUsersByDiscordId(discordId) {
    const collection = await getCollection();
    return collection.findOne({discordId});
}

async function listUser() {
    const collection = await getCollection();
    return collection.find();
}

async function updateUser(id, updateData) {
    const collection = await getCollection();
    const result = await collection.updateOne(
        {_id: new ObjectId(id)},
        {$set: updateData}
    );
    return result.modifiedCount;
}

async function deleteUser(id) {
    const collection = await getCollection();

    const result = await collection.deleteOne({_id: new ObjectId(id)});
    return result.deletedCount;
}

module.exports = {
    createIndexes,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getUsersByGoogleId,
    getUsersByDiscordId,
    listUser,
};
