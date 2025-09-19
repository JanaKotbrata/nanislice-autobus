const { connectToDb } = require("./connection-db");
const { ObjectId } = require("mongodb");

class Model {
  constructor() {
    // connectToDb is asynchronous, so it cannot be called in the constructor. This way - before any other method is used, it will already be initialized
    connectToDb().then((db) => {
      this.collection = db.collection(this._getCollectionName());
    });
  }

  /**
   * @return {String}
   * @private
   */
  _getCollectionName() {
    throw Error("You must define the _getCollectionName method");
  }

  transformId(data) {
    if (data?._id) {
      let result = { ...data, id: data._id.toString() };
      delete result._id;
      return result;
    } else {
      return data;
    }
  }

  getSys(forUpdate = false) {
    if (forUpdate) {
      return {
        "sys.mts": new Date().toISOString(),
      };
    } else {
      return {
        sys: {
          cts: new Date().toISOString(),
          mts: new Date().toISOString(),
          rev: 1,
        },
      };
    }
  }

  async find(pageInfo = { pageIndex: 0, pageSize: 1000 }, filter) {
    const list = await this.collection
      .find(filter)
      .skip(pageInfo.pageIndex * pageInfo.pageSize)
      .limit(pageInfo.pageSize)
      .toArray();
    const totalCount = await this.collection.countDocuments(filter);
    return {
      list,
      pageInfo: { ...pageInfo, totalCount },
    };
  }

  async insertOne(data) {
    data = { ...data, ...this.getSys() };
    const insertedResult = await this.collection.insertOne(data);
    return this.findOne({ id: insertedResult.insertedId });
  }

  async updateOne(id, updateData) {
    updateData = { ...updateData, ...this.getSys(true) };
    const revision = updateData.sys.rev;
    delete updateData.sys;
    await this.collection.updateOne(
      { _id: new ObjectId(id), "sys.rev": revision },
      { $set: updateData, $inc: { "sys.rev": 1 } },
    );
    return this.findOne({ id });
  }
  async findOne(data) {
    let result;
    if (data.id) {
      result = await this.collection.findOne({ _id: new ObjectId(data.id) });
    } else {
      result = await this.collection.findOne(data);
    }
    return this.transformId(result);
  }
}

module.exports = Model;
