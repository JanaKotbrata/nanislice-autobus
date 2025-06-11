const {ObjectId} = require('mongodb');
const Model = require('./model');
const collectionName = 'games';

class GamesRepository extends Model {
    _getCollectionName() {
        return collectionName;
    }

    async createIndexes() {
        await this.collection.createIndex({code: 1}, {unique: true});
        await this.collection.createIndex({
            'playerList.userId': 1,
            'status': 1
        });
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
        return await this.get({id});
    }

    async getGameByCode(code) {
        return await this.get({code});
    }


    async deleteGame(id) {
        const result = await this.collection.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }

    async findNotClosedGameByUserId(userId) {
        const result = await this.collection.findOne({
            'playerList': {
                $elemMatch: {
                    userId: userId
                }
            },
            'state': {
                $nin: ['closed']
            }
        })

        return this.transformId(result);
    }

}

module.exports = GamesRepository;
