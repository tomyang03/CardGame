let mongo = require("mongodb");
let ObjectId = require("mongodb").ObjectID;
const { profilescoll, tradescoll, userscoll } = require("./config");
const dbRtns = require("./dbroutines");
const authentication = require("basic-auth");

const processTrade = async (tradeId) => {
  let db = await dbRtns.loadDB();
  let id = tradeId;
  let trade = await dbRtns.findOne(db, tradescoll, { _id: ObjectId(id) });

  let player1cardsfromtrade = trade.player1cards; //array holding player1 cards selected in trade
  let player2cardsfromtrade = trade.player2cards; //array holding player2 cards selected in trade
  //exchange cards, get the players
  let player1 = await dbRtns.findOne(db, profilescoll, {
    name: trade.player1,
  });
  let player2 = await dbRtns.findOne(db, profilescoll, {
    name: trade.player2,
  });
  let player1cards = player1.cards; //array holding player1 cards in profile
  let player2cards = player2.cards; //array holding player2 cards in profile

  //count how many times each cards  in player1cardsfromtrade occurs in player1's hand
  const counter1 = player1cardsfromtrade.map((card) =>
    counter(card, player1cards)
  );

  const equaltozero = (count) => count === 0;
  // check if all the cards from the trade occur in the player's profile ie
  // check if there are some cards who have count = 0, if it does it means that the card
  // is part of the trade but does not occur on the player's hand, send json error message
  // trade failed because cards were not available in the player's hand
  let nozeroes1 = counter1.some(equaltozero);
  let error = {};
  if (nozeroes1) {
    error = " cards not available in player1's hand for trade";
  }

  //count how many times each cards occurs in player1cardsfromtrade
  const counter2 = player2cardsfromtrade.map((card) =>
    counter(card, player2cards)
  );

  let nozeroes2 = counter2.some(equaltozero);

  if (nozeroes2) {
    error = " cards not available in player2's hand for trade";
  }

  console.log("before delete");
  // delete the trade by it's id
  await dbRtns.deleteOne(db, tradescoll, { _id: ObjectId(id) });
  console.log("after delete");
  // if there are no zeroes for the counter in player1's and player2's hand,
  // meaning each card from the trade appears in the player's profile,
  if (!nozeroes1 && !nozeroes2) {
    //add the cards from trade for player1 and player2
    player1cards = player1cards.concat(player2cardsfromtrade);
    player2cards = player2cards.concat(player1cardsfromtrade);

    //delete the cards from each players profile that was traded
    // get all the cards from the profile and check if they are part of the trade,
    // if they are remove them from player1cards
    // keep only cards that are not part of the trade ie !player1cardsfromtrade.includes(card)
    const player1cardsfinal = player1cards.filter(
      (card) => !player1cardsfromtrade.containsObject(card)
    );
    const player2cardsfinal = player2cards.filter(
      (card) => !player2cardsfromtrade.containsObject(card)
    );

    // update player1 and player2,  attach the final cards array to each player
    player1.cards = player1cardsfinal;
    player2.cards = player2cardsfinal;

    // remove trade from each player's trade list,
    const map1 = player1.trades.map((x) => x._id);
    console.log(map1);
    console.log(id);
    console.dir(player1.trades.length);
    // tradeId is of type ObjectID id is of type string, different types use double equals
    const p1index = map1.findIndex((tradeId) => tradeId == id);
    console.log(p1index);
    player1.trades.splice(p1index, 1); // splice the tradelist array for player1 based on the tradeid

    console.dir(player1.trades.length);

    const map2 = player2.trades.map((x) => x._id);
    const p2index = map2.findIndex((tradeId) => tradeId == id);
    player2.trades.splice(p2index, 1); // splice the tradelist array for player2  based on the tradeid

    // update player1 and player2 with new cardlist and tradeslist
    let updatedplayer1 = await dbRtns.updateOne(
      db,
      profilescoll,
      { name: player1.name }, //search criteria
      player1 // object for update ie projection
    );

    let updatedplayer2 = await dbRtns.updateOne(
      db,
      profilescoll,
      { name: player2.name }, //search criteria
      player2 // object for update ie projection
    );
    const updatedplayers = [updatedplayer1, updatedplayer2];
    console.log("if");
    return { updatedplayers };
  } else {
    console.log("else");
    // remove trade from each player's trade list,
    const map1 = player1.trades.map((x) => x._id);
    console.log(map1);
    console.log(id);
    console.dir(player1.trades.length);
    // tradeId is of type ObjectID id is of type string, different types use double equals
    const p1index = map1.findIndex((tradeId) => tradeId == id);
    console.log(p1index);
    player1.trades.splice(p1index, 1); // splice the tradelist array for player1 based on the tradeid

    console.dir(player1.trades.length);

    const map2 = player2.trades.map((x) => x._id);
    const p2index = map2.findIndex((tradeId) => tradeId == id);
    player2.trades.splice(p2index, 1); // splice the tradelist array for player2  based on the tradeid

    // update player1 and player2 with new cardlist and tradeslist
    let updatedplayer1 = await dbRtns.updateOne(
      db,
      profilescoll,
      { name: player1.name }, //search criteria
      player1 // object for update ie projection
    );

    let updatedplayer2 = await dbRtns.updateOne(
      db,
      profilescoll,
      { name: player2.name }, //search criteria
      player2 // object for update ie projection
    );
    // case: some cards are not availabe in the player's profile, return error
    return { error };
  }
};

const rejectTrade = async (tradeId) => {
  let db = await dbRtns.loadDB();
  let id = tradeId;
  let trade = await dbRtns.findOne(db, tradescoll, { _id: ObjectId(id) });

  //remove trade from tradelist for each player
  let player1 = await dbRtns.findOne(db, profilescoll, {
    name: trade.player1,
  });
  let player2 = await dbRtns.findOne(db, profilescoll, {
    name: trade.player2,
  });

  // remove trade from each player's trade list
  // map1:is a new array with all the Ids from player1.trades
  const map1 = player1.trades.map((x) => x._Id);
  const p1index = map1.indexOf(id);
  player1.trades.splice(p1index, 1); // splice the tradelist array for player1 based on the tradeid

  const map2 = player2.trades.map((x) => x._Id);
  const p2index = map2.indexOf(id);
  player2.trades.splice(p2index, 1); // splice the tradelist array for player2  based on the tradeid

  // update player1 and player2 with new tradeslist
  let updatedplayer1 = await dbRtns.updateOne(
    db,
    profilescoll,
    { name: player1.name }, //search criteria
    player1 // object for update ie projection
  );

  let updatedplayer2 = await dbRtns.updateOne(
    db,
    profilescoll,
    { name: player2.name }, //search criteria
    player2 // object for update ie projection
  );

  //update player1 with the new tradelist

  await dbRtns.deleteOne(db, tradescoll, { _id: ObjectId(id) });
};

// player1 wants to add player2 as a friend
const addFriend = async (player1, player2) => {
  let db = await dbRtns.loadDB();

  let trade = await dbRtns.findOne(db, tradescoll, { _id: ObjectId(id) });
};

// extension method for arrays to check if the array contains a certain object which are stored as references in javaScript
Array.prototype.containsObject = function (obj) {
  for (let i = 0; i < this.length; i++) {
    if (JSON.stringify(this[i]) === JSON.stringify(obj)) {
      return true;
    }
  }
  return false;
};

// a function which counts how many times a given object (obj) occurs in an array
function counter(obj, array) {
  let count = 0;
  for (let i = 0; i < array.length; ++i) {
    if (JSON.stringify(array[i]) === JSON.stringify(obj)) {
      ++count;
    }
  }
  return count;
}

const authenticateUser = async (req, res, next) => {
  let db = await dbRtns.loadDB();
  let message = null;
  let authenticated = false;
  const users = await dbRtns.findAll(db, userscoll);
  const credentials = authentication(req); // credentials uses interface with name and pass as fields
  if (credentials) {
    const user = users.find((user) => user.name === credentials.name);
    if (user) {
      authenticated = credentials.pass === user.password;
      if (authenticated) {
        console.log(`Authentication successful for username: ${user.name}`);
        req.currentUser = user;
      } else {
        message = `Authentication failed for username: ${user.name}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = "Authorization header not found";
  }
  if (message) {
    console.warn(message);
    res.status(401).send({ error: message });
  } else {
    next();
  }
};

module.exports = {
  processTrade,
  rejectTrade,
  addFriend,
  authenticateUser,
};
