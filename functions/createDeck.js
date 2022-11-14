/* creates a deck of cards on the server. To seed the db: run node createDeck.js */
const { url, dbname, cardscoll } = require("./config");
const { cards } = require("./cards");
//"artist":"Arthur Bozonnet","attack":3,"cardClass":"MAGE","health":2,"name":"Fallen Hero","rarity":"RARE"
let mongo = require("mongodb");
let MongoClient = mongo.MongoClient;
let db;

const initdb = async () => {
  MongoClient.connect(
    url,
    { useUnifiedTopology: true },
    function (err, client) {
      if (err) throw err;

      db = client.db(dbname);

      db.listCollections().toArray(function (err, result) {
        if (result.length == 0) {
          createDeck(client);
          return;
        }

        let numDropped = 0;
        let toDrop = result.length;
        result.forEach((collection) => {
          db.collection(collection.name).drop(function (err, delOK) {
            if (err) {
              throw err;
            }

            console.log("Dropped collection: " + collection.name);
            numDropped++;

            if (numDropped == toDrop) {
              createDeck(client);
              return;
            }
          });
        });
      });
    }
  );
};

const createDeck = async (client) => {
  db = client.db(dbname);
  db.collection(cardscoll).insertMany(cards, function (err, result) {
    if (err) throw err;
    console.log("Successfuly inserted " + result.insertedCount + " cards.");
    process.exit();
  });
};

initdb();
