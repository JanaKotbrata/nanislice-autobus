const { ObjectId } = require("mongodb");
const Model = require("./model");
const collectionName = "games";
const { States } = require("../../../shared/constants/game-constants.json");
class GamesRepository extends Model {
  _getCollectionName() {
    return collectionName;
  }

  async createIndexes() {
    await this.collection.createIndex({ code: 1 }, { unique: true });
    await this.collection.createIndex({
      "playerList.userId": 1,
      status: 1,
    });
  }

  async create(userData) {
    return this.insertOne(userData);
  }

  /**
   * Attempts to create a game with a unique code, retrying on duplicate key error.
   * @param {Function} gameFactory - Function that returns a new game object (with a new code) for each attempt.
   * @param {number} maxAttempts - Maximum number of attempts before failing.
   * @param {Function} [onDuplicate] - Optional callback for duplicate key error (e.g., logging).
   * @returns {Promise<Object>} The created game document.
   * @throws {Error} If max attempts are exceeded or a non-duplicate error occurs.
   */
  async uniqueCreate(gameFactory, maxAttempts, onDuplicate) {
    let tryCount = 0;
    let lastError = null;
    while (tryCount < maxAttempts) {
      const newGame = gameFactory();
      try {
        return await this.create(newGame);
      } catch (error) {
        if (error.code === 11000) {
          tryCount++;
          if (onDuplicate) onDuplicate(error, tryCount);
          lastError = error;
          continue;
        } else {
          throw error;
        }
      }
    }
    // If we get here, max attempts exceeded
    const err = new Error(
      "Failed to create unique game after " + maxAttempts + " attempts",
    );
    err.code = 11000;
    err.lastError = lastError;
    throw err;
  }

  async update(id, updateData) {
    return await this.updateOne(id, updateData);
  }

  async list(pageInfo) {
    return await this.find(pageInfo);
  }

  async listByState(state, pageInfo) {
    return await this.find(pageInfo, { state });
  }

  async getById(id) {
    return await this.findOne({ id });
  }

  async getByCode(code) {
    return await this.findOne({ code });
  }

  async delete(id) {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount;
  }

  async findNotClosedGameByUserId(userId) {
    const result = await this.collection.findOne({
      playerList: {
        $elemMatch: {
          userId: userId,
        },
      },
      state: {
        $nin: [States.CLOSED, States.FINISHED],
      },
    });

    return this.transformId(result);
  }
}

module.exports = GamesRepository;
