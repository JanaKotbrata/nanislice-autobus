const {ObjectId} = require('mongodb');
const Model = require('./model');
const collectionName = 'users';

class UsersRepository extends Model { //TODO add revision
    _getCollectionName() {
        return collectionName;
    }

    async createIndexes() {
        await this.collection.createIndex({email: 1}, {unique: true});
        await this.collection.createIndex({googleId: 1}, {
            unique: true,
            partialFilterExpression: {googleId: {$exists: true}}
        });
        await this.collection.createIndex({discordId: 1}, {
            unique: true,
            partialFilterExpression: {discordId: {$exists: true}}
        });

    }

    async createUser(userData) {
        return this.create(userData)
    }

    async getUserById(id) {
        return this.get({id});
    }

    async getUserByGoogleId(googleId) {
        return this.get({googleId});
    }

    async getUserByDiscordId(discordId) {
        return this.get({discordId});
    }

    async getUserByEmail(email) {
        return this.get({email});
    }

    async listUser(pageInfo) {
        return this.list(pageInfo, {});
    }

    async addUserXP(userId, amount){
        const result = await this.collection.findOneAndUpdate(
            {_id: new ObjectId(userId)},
            {$inc: {xp: amount}},
            {returnDocument: 'after'}
        );
        return result.xp;
    }
    async updateUser(id, updateData) {
        return this.update(id, updateData);
    }

    async deleteUser(id) {
        const result = await this.collection.deleteOne({_id: new ObjectId(id)});
        return result.deletedCount;
    }
}

module.exports = UsersRepository;
