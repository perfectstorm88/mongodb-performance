const assert = require('assert');
const {ObjectId,MongoClient} = require('mongodb');
// Connection URL
require('dotenv').config();
const url = process.env.DATABASE_URL;
const util = require('util');


tables = {
    A:100,
    B:1000,
    C:10000,
    D:100000,
    A1:100,
    A2:100,
    A3:100,
    A4:100,
    A5:100,
    A6:100,
}
class Test{
    constructor(db,appId,tableName,dataNum,seq){
        this.appId= appId;
        this.seq = seq;
        this.tableName=tableName;
        this.dataNum=dataNum;
        this.db = db;
        this.collectionName = `${seq}_${appId}_${tableName}_${dataNum}`;
        this.collection = null;
        this.timeRecords = [];
    }
    createFakeData(dataNum){
        let retList = [];
        for(let i =0;i< dataNum;i++){
            retList.push({
                F1:`StringString_${i}`,
                F2: new Date(i),
                F3:`StringString3_${i}`,
                F4:"StringStringStringStringStringString",
                F5:"StringStringStringStringStringString",
                F6:"StringStringStringStringStringString",
                F7:"StringStringStringStringStringString",
                F8:"StringStringStringStringStringString",
                F9:"StringStringStringStringStringString",
                F10:"StringStringStringStringStringString",
            })
        }
        return retList;
    }
    async getOrCreateCollection(){
        this.collection = this.db.collection(this.collectionName);
        assert(this.collection);
    }
    async createIndexs(){
        try{
            await this.db.createIndex(this.collectionName,{F1:1});
            await this.db.createIndex(this.collectionName,{F2:1});
        }catch(e){
            console.log(e);
        }
    }
    async insertBatch(){
        let retList = this.createFakeData(this.dataNum);
        let start = new Date();
        let begin = 0;
        while (begin < retList.length) {
            let _data = retList.slice(begin, begin + 5000);
            await this.collection.insertMany(_data);
            begin += 5000;
        }
        let ms = new Date().getTime()-start.getTime();
        console.log(`insertBatch`,ms);
        this.timeRecords.push(ms);
    }
    async count(){        
        let start = new Date();
        let ret = await this.collection.countDocuments({});
        assert(ret,this.dataNum);
        let ms = new Date().getTime()-start.getTime();
        console.log(`count`,ms);
        this.timeRecords.push(ms);
    }
    async query(){
        let retList = this.createFakeData(1);
        let testData = retList[0];
        let start = new Date();
        let ret = await this.collection.find({F1:testData.F1}).toArray();
        assert(ret.length,1);
        let ms = new Date().getTime()-start.getTime();
        console.log(`count`,ms);
        this.timeRecords.push(ms);
        start = new Date();
        ret = await this.collection.find({F2:testData.F2}).toArray();
        assert(ret.length,1);
        ms = new Date().getTime()-start.getTime();
        console.log(`count`,ms);
        this.timeRecords.push(ms);
        start = new Date();
        ret = await this.collection.find({F3:testData.F3}).toArray();
        assert(ret.length,1);
        ms = new Date().getTime()-start.getTime();
        console.log(`count`,ms);
        this.timeRecords.push(ms);
    }
    async main(){
        await this.getOrCreateCollection();
        await this.createIndexs();
        await this.insertBatch();
        await this.count();
        await this.query();
        console.error(this.collectionName,this.timeRecords);
    }
}

(async () => {
    const client = await util.promisify(MongoClient.connect)(url,{useNewUrlParser:true});
    const db = client.db();
    var appId =new ObjectId();
    console.log = function(){};
    for(let i=0;i<2000;i++){
        let stats = await db.stats();
        let _stats = {
            "collections":stats.collections,
            "objects":((stats.objects/1024)|0)+'k',
            "avgObjSize":(stats.avgObjSize)|0,
            "dataSize":((stats.dataSize/1024/1024)|0)+"MB",
            "storageSize":((stats.storageSize/1024/1024)|0)+"MB",
            "indexes":stats.indexes,
            "indexSize":((stats.indexSize/1024/1024)|0)+"MB"
        }
        console.error(`[stats]${JSON.stringify(_stats)}`);
        for(let k in tables){
            let num = tables[k]
            if(i % 100 != 0 && num > 10000)num = 100;
            let test = new Test(db,appId,k,num,i);
            await test.main();
        }
    }
})();