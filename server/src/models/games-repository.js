const {ObjectId} = require('mongodb');
const Model = require('./model');
const collectionName = 'games';

class GamesRepository extends Model {
    _getCollectionName() {
        return collectionName;
    }

    async createIndexes() {
        await this.collection.createIndex({code: 1}, {unique: true});
    }

    async createGame(userData) {
        return this.create(userData);
    }

    async updateGame(id, updateData) {
        return await this.update(id, updateData);
    }

    async listGame(pageInfo) {
        return await this.list(pageInfo);
    }

    async listGameByState(state, pageInfo) {

        return await this.list(pageInfo, {state});
    }

    async getGameById(id) {
        let result = await this.collection.findOne({_id: new ObjectId(id)});
        return this.transformId(result);//TODO udělat v tom modelu a jen převzít
    }

    async getGameByCode(code) {
        let result =await this.collection.findOne({code});
        return this.transformId(result); //TODO udělat v tom modelu a jen převzít
    }


    async deleteGame(id) {
        const result = await this.collection.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}

module.exports = GamesRepository;
