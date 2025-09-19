const Model = require("./model");
const collectionName = "tokenHash";
const hourInMs = 3600 * 1000;
class TokenHashRepository extends Model {
  _getCollectionName() {
    return collectionName;
  }

  async createIndexes() {
    await this.collection.createIndex({ userId: 1, hash: 1 });
    await this.collection.createIndex(
      { expiration: 1 },
      { expireAfterSeconds: 0 },
    );
  }

  async create(userId, hash) {
    let userData = {
      userId,
      hash,
      expiration: new Date(Date.now() + hourInMs * 24),
    };
    return this.insertOne(userData);
  }

  async getByIdAndHash(userId, hash) {
    return await this.collection.findOne({
      userId,
      hash,
    });
  }
  async deleteByIdAndHash(userId, hash) {
    const result = await this.collection.deleteOne({ userId, hash });
    return result.deletedCount === 1;
  }

  async deleteAll() {
    return await this.collection.deleteMany({});
  }
}

module.exports = TokenHashRepository;
