const express = require("express");
const router = express.Router();
let ObjectId = require("mongodb").ObjectID;
const {
  url,
  profilescoll,
  tradescoll,
  requestscoll,
  userscoll,
  cardscoll,
} = require("./config");
const dbRtns = require("./dbroutines");
const helper = require("./helpermethods");
const path = require("path");

// router.get("/", async (req, res) => {
//   //res.status(200).sendFile(path.join(__dirname + "/Home.html"));
//   res.format({
//     "text/html": () => {
//       res.render("login", { title: "Hey", numbers: [1, 2, 3, 5] });
//     },
//   });
// }),
// Get all profiles
router.get("/profiles", async (req, res) => {
  try {
    console.log(url);
    let db = await dbRtns.loadDB();
    let profiles = await dbRtns.findAll(db, profilescoll);
    res.status(200).send({ profiles: profiles });
  } catch (err) {
    console.log(err.stack);
    res.status(500).send("GET all data failed - internal server error");
  }
}),
  //Get a particular profile by name used to retrieve all the information
  // when a user wants to view a friend and his cards
  router.get("/profile/:name", async (req, res) => {
    try {
      let db = await dbRtns.loadDB();
      let name = req.params.name;
      let profile = await dbRtns.findOne(db, profilescoll, { name: name });
      res.status(200).send({ profile: profile });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("GET all data failed - internal server error");
    }
  }),
  //Get a particular card by name to display the information to the user when user selects
  // a card from the profile
  router.get("/card/:name", async (req, res) => {
    try {
      let db = await dbRtns.loadDB();
      let name = req.params.name;
      let card = await dbRtns.findOne(db, cardscoll, { name: name });
      res.status(200).send({ card: card });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("Getting card failed - internal server error");
    }
  }),
  //Get a particular trade by id used to display trade details under profiles for a particular player
  router.get("/trade/:id", async (req, res) => {
    try {
      let db = await dbRtns.loadDB();
      let id = req.params.id;
      let trade = await dbRtns.findOne(db, tradescoll, { _id: ObjectId(id) });
      res.status(200).send({ trade: trade });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("GET all data failed - internal server error");
    }
  }),
  // creates a new trade document when user clicks on "create trade"
  router.post("/maketrade/", async (req, res) => {
    try {
      let db = await dbRtns.loadDB();
      const trade = {
        player1: req.body.player1,
        player2: req.body.player2,
        player1cards: req.body.player1cards,
        player2cards: req.body.player2cards,
      };

      console.dir(req.body);

      const addedtrade = await dbRtns.addOne(db, tradescoll, trade);
      // create a new trade object which holds the _id from addedtrade
      // and all the informaion from request
      const newtrade = {
        _id: ObjectId(addedtrade.insertedId),
        player1: req.body.player1,
        player2: req.body.player2,
        player1cards: req.body.player1cards,
        player2cards: req.body.player2cards,
      };
      // retrieve player1 and player2 from db
      let player1 = await dbRtns.findOne(db, profilescoll, {
        name: trade.player1,
      });
      let player2 = await dbRtns.findOne(db, profilescoll, {
        name: trade.player2,
      });

      //attach newtrade to each player's trade list
      player1.trades.push(newtrade);
      player2.trades.push(newtrade);

      const updatedplayer1 = await dbRtns.updateOne(
        db,
        profilescoll,
        { name: player1.name }, //search criteria
        player1 // object for update ie projection
      );

      const updatedplayer2 = await dbRtns.updateOne(
        db,
        profilescoll,
        { name: player2.name }, //search criteria
        player2 // object for update ie projection
      );

      res.status(200).send({
        trade: addedtrade,
        player1: updatedplayer2,
        player2: updatedplayer2,
      });
    } catch (err) {
      console.log(err.stack);
      res
        .status(500)
        .send({ error: "Proposing trade failed - internal server error" });
    }
  }),
  // make the trade by exchanging cards between 2 players
  router.get("/accepttrade/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const response = await helper.processTrade(id);
      if (response.error) {
        res.status(200).send({ error: response.error });
      } else {
        res.status(200).send({ trade: response.updatedplayers });
      }
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("Trade failed - Internal Server Error.");
    }
  }),
  // Receiver of trade rejects trade proposal
  router.delete(
    "/rejecttrade/:id",

    async (req, res) => {
      try {
        let db = await dbRtns.loadDB();
        const id = req.params.id;
        await helper.rejectTrade(id);
        res.status(200).send({ msg: "Trade rejected successfully." });
      } catch (err) {
        console.log(err.stack);
        res.status(500).send("Internal Server Error.");
      }
    }
  ),
  //Creat a new friend request ie proposal
  router.post("/sendfriendrequest", async (req, res) => {
    try {
      let db = await dbRtns.loadDB();
      const proposer = req.body.proposer;
      const receiver = req.body.receiver;
      console.dir(requestscoll);

      // check db if a combination of proposer and receiver with the given parameters already exists
      // requests must be unique, otherwise someone can accept friend with somebody  and later reject the same person again
      const requests = await dbRtns.findAll(db, requestscoll, {}, {});

      const namesExists = (request) =>
        (request.proposer === proposer && request.receiver === receiver) ||
        (request.proposer === receiver && request.receiver === proposer);
      const combExists = requests.some(namesExists);
      // if it does return request, error message
      if (combExists) {
        res.status(200).send({
          error: "Cannot add friend request,friend request already exists.",
        });
        return; //exit GET request
      }

      // proposals have to be unique

      let proposal = {
        proposer: proposer,
        receiver: receiver,
      };
      const newproposal = await dbRtns.addOne(db, requestscoll, proposal);
      // create a new proposal object with the id after the insert which is newproposal.insertedId,
      // we need the id for other requests to reject and accept friendship
      const proposaltoadd = {
        _id: ObjectId(newproposal.insertedId),
        proposer: proposer,
        receiver: receiver,
      };
      //console.dir(proposaltoadd);
      //Attach the proposal to each player
      let player1 = await dbRtns.findOne(db, profilescoll, {
        name: proposer,
      });
      let player2 = await dbRtns.findOne(db, profilescoll, {
        name: receiver,
      });

      player1.requests.push(proposaltoadd);
      player2.requests.push(proposaltoadd);

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

      res.status(200).send({ newprofiles: [updatedplayer1, updatedplayer2] });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send({ error: "Internal Server Error." });
    }
  }),
  // Receiver accepts a proposal with given id, update friendlist
  router.put("/acceptfriend/:id", async (req, res) => {
    try {
      let db = await dbRtns.loadDB();
      const id = req.params.id;
      // retrieve the proposal from db
      const proposal = await dbRtns.findOne(db, requestscoll, {
        _id: ObjectId(id),
      });
      const proposer = await dbRtns.findOne(db, profilescoll, {
        name: proposal.proposer,
      });
      const receiver = await dbRtns.findOne(db, profilescoll, {
        name: proposal.receiver,
      });

      // do not allow friends to become friends twice
      if (
        proposer.friends.includes(receiver.name) ||
        receiver.friends.includes(proposer.name)
      ) {
        res
          .status(500)
          .send({ error: "Cannot add friend, players are already friends." });
        return; //exit GET request
      }

      //update friendlists for proposer and receiver by adding the names
      proposer.friends.push(receiver.name);
      receiver.friends.push(proposer.name);
      // retrieve the index of the proposal based on its _id from the array proposer.requests,
      //and splice the requests array based on the id
      const pindex = proposer.requests.indexOf(proposal._id);
      proposer.requests.splice(pindex, 1);

      const rindex = receiver.requests.indexOf(proposal._id);
      receiver.requests.splice(rindex, 1);

      const updatedplayer1 = await dbRtns.updateOne(
        db,
        profilescoll,
        { name: proposer.name }, //search criteria
        proposer // update proposer with the new proposer object containing the new requestslist
      );

      const updatedplayer2 = await dbRtns.updateOne(
        db,
        profilescoll,
        { name: receiver.name }, //search criteria
        receiver // update friendlist with the new receiver object containing the new requestslist
      );

      //delete the friend request
      await dbRtns.deleteOne(db, requestscoll, { _id: ObjectId(id) });

      res.status(200).send({ newprofiles: [updatedplayer1, updatedplayer2] });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("Internal Server Error.");
    }
  }),
  // Receiver rejects a proposal with given id, update requestlist by removing the rejected request from the array
  router.delete("/rejectfriend/:id", async (req, res) => {
    try {
      let db = await dbRtns.loadDB();
      const id = req.params.id;
      // retrieve the proposal from db
      const proposal = await dbRtns.findOne(db, requestscoll, {
        _id: ObjectId(id),
      });
      const proposer = await dbRtns.findOne(db, profilescoll, {
        name: proposal.proposer,
      });
      const receiver = await dbRtns.findOne(db, profilescoll, {
        name: proposal.receiver,
      });

      // splice the requests array based on the id
      const pindex = proposer.requests.indexOf(proposal._id);
      proposer.requests.splice(pindex, 1);

      const rindex = receiver.requests.indexOf(proposal._id);
      receiver.requests.splice(rindex, 1);
      const updatedplayer1 = await dbRtns.updateOne(
        db,
        profilescoll,
        { name: proposer.name }, //search criteria
        proposer // update proposer with the new proposer object containing the new requestslist
      );

      const updatedplayer2 = await dbRtns.updateOne(
        db,
        profilescoll,
        { name: receiver.name }, //search criteria
        receiver // update friendlist with the new receiver object containing the new requestslist
      );

      //delete the friend request
      await dbRtns.deleteOne(db, requestscoll, { _id: ObjectId(id) });

      res.status(200).send({ newprofiles: [updatedplayer1, updatedplayer2] });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("Internal Server Error.");
    }
  }),
  // retrieve user information for the given name
  router.get("/request/:id", async (req, res) => {
    try {
      let db = await dbRtns.loadDB();
      const id = req.params.id;
      const request = await dbRtns.findOne(db, requestscoll, {
        _id: ObjectId(id),
      });

      res.status(200).send({ request: request });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("Internal Server Error.");
    }
  }),
  // retrieve user information for the given name
  router.get("/user/:name", helper.authenticateUser, async (req, res) => {
    try {
      let db = await dbRtns.loadDB();
      const name = req.params.name;
      const user = await dbRtns.findOne(db, userscoll, {
        name: name,
      });

      res.status(200).send({ user: user });
    } catch (err) {
      console.log(err.stack);
      res
        .status(200)
        .send({ error: "User not found or Internal Server Error." });
    }
  }),
  // register user, also prevents duplicate users from being registered
  router.post("/register", async (req, res) => {
    try {
      let db = await dbRtns.loadDB();

      const name = req.body.name;
      console.dir(req.body);
      console.log(name);
      // retrieve the entire users collection
      const users = await dbRtns.findAll(db, userscoll, {}, {});
      // check if the user already exists in userscoll, if it does return 500
      const found = users.find((user) => user.name === name);
      if (found) {
        res
          .status(200)
          .send({ error: "Cannot sign up user, username already exists." });
        return;
      }
      // user does not exists in db
      const password = req.body.password;
      const user = { name: name, password: password };
      // add new user to db
      const addeduser = await dbRtns.addOne(db, userscoll, user);

      //give new user 10 random cards
      const cards = await dbRtns.findAll(db, cardscoll, {}, {});
      let playercards = [];

      for (let i = 0; i < 10; ++i) {
        idx = Math.floor(Math.random() * (cards.length - 1) + 0);
        playercards.push(cards[idx]);
      }
      //create a new profile with the playercards for the list of cards belonging to the player
      const player = {
        name: name,
        friends: [],
        cards: playercards,
        trades: [],
        requests: [],
      };
      const newprofile = await dbRtns.addOne(db, profilescoll, player);
      res.status(200).send({ newprofile: newprofile });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send("Internal Server Error.");
    }
  });

module.exports = router;
