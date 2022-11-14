const MongoClient = require("mongodb").MongoClient;
const { url, dbname } = require("./config");
let db;
const loadDB = async () => {
  if (db) {
    console.log("using established connection");
    return db;
  }
  try {
    console.log("establishing test new connection to mongodb localhost");
    console.log("connect");
    console.log(url);
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = client.db(dbname);
  } catch (err) {
    console.log(err);
  }
  return db;
};

const addOne = (db, coll, doc) => db.collection(coll).insertOne(doc);

const deleteAll = (db, coll) => db.collection(coll).deleteMany({});

const findOne = (db, coll, criteria) => db.collection(coll).findOne(criteria);

const findAll = (db, coll, criteria, projection) =>
  db.collection(coll).find(criteria).project(projection).toArray();

const updateOne = (db, coll, criteria, projection) =>
  db
    .collection(coll)
    .findOneAndUpdate(criteria, { $set: projection }, { rawResult: true });
const deleteOne = (db, coll, criteria) =>
  db.collection(coll).deleteOne(criteria);

module.exports = {
  loadDB,
  addOne,
  deleteAll,
  findOne,
  findAll,
  updateOne,
  deleteOne,
};
