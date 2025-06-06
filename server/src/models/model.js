const connectToDb = require('./connection-db');
const {ObjectId} = require('mongodb');

class Model {
    constructor() {
        // connectToDb je asynchronni, což se nedá volat v konstruktoru. Tak takhle - než se použije kterákoli další metoda, už bude naplněno
        connectToDb().then(db => {
            this.collection = db.collection(this._getCollectionName());
        })
    }

    /**
     * @return {String}
     * @private
     */
    _getCollectionName() {
        throw Error("Musís nadefinovat metodu _getCollectionName")
    }

    transformId(data) {
        if (data?._id) {
            let result = {...data, id: data._id.toString()};
            delete result._id;
            return result;
        } else {
            return data;
        }
    }

    getSys(forUpdate = false) {
        if (forUpdate) {
            return {
                "sys.mts": new Date().toISOString()
            }

        } else {
            return {
                sys: {
                    cts: new Date().toISOString(),
                    mts: new Date().toISOString(),
                    rev: 1
                }
            }
        }
    }

    async list(pageInfo = {pageIndex: 0, pageSize: 1000}, filter) {
        const list = await this.collection.find(filter).skip(pageInfo.pageIndex * pageInfo.pageSize).limit(pageInfo.pageSize).toArray();
        const totalCount = await this.collection.countDocuments();//TODO na základě filtru a ne všeho
        return {
            list,
            pageInfo: {...pageInfo, totalCount}
        }
    }

    async create(data) {
        data = {...data, ...this.getSys()};
        const insertedResult = await this.collection.insertOne(data);
        const result = await this.collection.findOne({_id: insertedResult.insertedId}); //TOODO use furute method get
        return this.transformId(result);
    }

    async update(id, updateData) {
        updateData = {...updateData, ...this.getSys(true)};
        const revision = updateData.sys.rev;
        delete updateData.sys;
        await this.collection.updateOne(
            {_id: new ObjectId(id), "sys.rev": revision },
            {$set: updateData, $inc: { "sys.rev": 1 }},
        );
        const result = await this.collection.findOne({_id: new ObjectId(id)});
        return this.transformId(result);
    }
    async get(data){
        let result;
        if(data.id) {
            result = await this.collection.findOne({_id: new ObjectId(data.id)});
        }else{
            result = await this.collection.findOne(data);
        }
        return this.transformId(result);
    }
}

module.exports = Model;