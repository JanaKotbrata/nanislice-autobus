const traverseDirectory = require('./traverse-directory');
const connectToDb = require('../models/connection-db');

async function initRepository(fullPath) {
    const repository = require(fullPath);
    const repo = new repository();
    //kvůli tomu then - protože se then spouští až na konci a vše ostatní se přovede před tím, tím pádem to prostě nestihne zavalit ten vál
    await connectToDb();
    return repo.createIndexes();
}

async function createIndexes(directory) {
    const promises = [];
    traverseDirectory(directory, "repository.js", (fullPath) => promises.push(initRepository(fullPath)));
    await Promise.all(promises);
}

module.exports = createIndexes;