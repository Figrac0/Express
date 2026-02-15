const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

const mongoConnect = (callback) => {
    MongoClient.connect(uri)
        .then((client) => {
            _db = client.db();
            callback();
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }
    throw "No db found";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
