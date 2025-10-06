const { ObjectId } = require("mongodb");
const { Roles } = require("../../../shared/constants/game-constants.json");
const Model = require("./model");
const { calculateLevel } = require("../services/game-service");
const collectionName = "users";

class UsersRepository extends Model {
  _getCollectionName() {
    return collectionName;
  }

  async createIndexes() {
    await this.collection.createIndex({ email: 1 }, { unique: true });
    await this.collection.createIndex(
      { googleId: 1 },
      {
        unique: true,
        partialFilterExpression: { googleId: { $exists: true } },
      },
    );
    await this.collection.createIndex(
      { discordId: 1 },
      {
        unique: true,
        partialFilterExpression: { discordId: { $exists: true } },
      },
    );
  }

  async create(
    serviceId = {},
    email,
    name,
    picture,
    level = 0,
    role = Roles.PLEB,
  ) {
    let userData = { ...serviceId, email, name, picture, level, role };
    return this.insertOne(userData);
  }

  async getById(id) {
    return this.findOne({ id });
  }

  async getByGoogleId(googleId) {
    return this.findOne({ googleId });
  }

  async getByDiscordId(discordId) {
    return this.findOne({ discordId });
  }

  async getBySeznamId(seznamId) {
    return this.findOne({ seznamId });
  }

  async getByEmail(email) {
    return this.findOne({ email });
  }

  async list(pageInfo) {
    return this.find(pageInfo, {});
  }

  async listByRole(role, pageInfo) {
    return this.find(pageInfo, { role });
  }

  async addXP(userId, amount) {
    const resultXP = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $inc: { xp: amount } },
      { returnDocument: "after" },
    );
    const newLevel = calculateLevel(resultXP.xp);
    const result = { xp: resultXP.xp };

    if (newLevel !== resultXP.level) {
      const level = await this.setLevel(userId, newLevel);
      result.level = level;
    }
    return { [userId]: result };
  }

  async setLevel(userId, level) {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { level } },
      { returnDocument: "after" },
    );
    return result.level;
  }

  async update(id, updateData) {
    return this.updateOne(id, updateData);
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount;
  }
}

module.exports = UsersRepository;
