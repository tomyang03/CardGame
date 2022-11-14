import React, { useState, useContext, useEffect, Fragment } from "react";
import { getAuth } from "./Auth";
import { Link } from "react-router-dom";
import { withRouter } from "react-router"; // to access the profilename that is being passed
// via the link from Profile.js via state
import { GlobalStateContext } from "./Context";
import Header from "./Header";
const { SERVERURL } = require("./Config");

const MakeTrade = (props) => {
  const context = useContext(GlobalStateContext);
  const [player1] = useState(context.player1.get);
  const [player2] = useState(context.player2.get);
  console.log(context.player1cards.get);
  console.log(context.player2cards.get);
  const [player1cards] = useState(context.player1cards.get);
  const [player2cards] = useState(context.player2cards.get);
  const [player1cardsselected, setPlayer1cardsselected] = useState([]);
  const [player2cardsselected, setPlayer2cardsselected] = useState([]);

  const [player1cardindexselected, setPlayer1cardindexselected] = useState([]);
  const [player2cardindexselected, setPlayer2cardindexselected] = useState([]);

  const Player1CardChecked = (card, cardindex, e) => {
    //if the card is checked
    if (e.target.checked) {
      // if the index of the card has not been selected yet, then push the card and index to their arrays
      if (!player1cardindexselected.includes(cardindex)) {
        console.log(e.target.value);
        // add card to the selectedcards array
        let newarray = player1cardsselected;
        newarray.push(card);
        setPlayer1cardsselected(newarray);
        // add the cardindex to player1cardsindexselected
        let newindexarray = player1cardindexselected;
        newindexarray.push(cardindex);
        setPlayer1cardindexselected(newindexarray);
      } // else if the index of the card has been selected already, do nothing here
    } else {
      // if the card is not checked // a card that was checked got unchecked
      console.log("unchecking card");
      if (player1cardindexselected.includes(cardindex)) {
        console.log("unchecking selected card");
        console.log(e.target.value);
        let index = player1cardsselected.indexOf(card);
        // remove the card from player1cardsselected
        let newarray = player1cardsselected;
        newarray.splice(index, 1);
        setPlayer1cardsselected(newarray);
        // remove the index from the index array ie player1cardindexselected
        index = player1cardindexselected.indexOf(cardindex);
        let newindexarray = player1cardindexselected;
        newindexarray.splice(index, 1);
        setPlayer1cardindexselected(newindexarray);
      }
    }
  };

  // const Player2CardChecked = (card, e) => {
  //   console.dir(e.target.value);
  //   //if the card is checked
  //   if (e.target.checked) {
  //     console.log("if");
  //     // add card to the selectedcards array
  //     let newarray = player2cardsselected;
  //     newarray.push(card);
  //     setPlayer2cardsselected(newarray);
  //   }
  // };

  const Player2CardChecked = (card, cardindex, e) => {
    //if the card is checked
    if (e.target.checked) {
      // if the index of the card has not been selected yet, then push the card and index to their arrays
      if (!player2cardindexselected.includes(cardindex)) {
        console.log(e.target.value);
        // add card to the selectedcards array
        let newarray = player2cardsselected;
        newarray.push(card);
        setPlayer2cardsselected(newarray);
        // add the cardindex to player1cardsindexselected
        let newindexarray = player2cardindexselected;
        newindexarray.push(cardindex);
        setPlayer2cardindexselected(newindexarray);
      } // else if the index of the card has been selected already, do nothing here
    } else {
      // if the card is not checked // a card that was checked got unchecked
      console.log("unchecking card");
      if (player2cardindexselected.includes(cardindex)) {
        console.log("unchecking selected card");
        console.log(e.target.value);
        let index = player2cardsselected.indexOf(card);
        // remove the card from player1cardsselected
        let newarray = player2cardsselected;
        newarray.splice(index, 1);
        setPlayer2cardsselected(newarray);
        // remove the index from the index array ie player1cardindexselected
        index = player2cardindexselected.indexOf(cardindex);
        let newindexarray = player2cardindexselected;
        newindexarray.splice(index, 1);
        setPlayer2cardindexselected(newindexarray);
      }
    }
  };

  const makeTrade = async () => {
    try {
      let headers = new Headers();
      headers.append("Content-Type", "application/json");

      const trade = {
        player1: player1,
        player2: player2,
        player1cards: player1cardsselected,
        player2cards: player2cardsselected,
      };
      // headers.append(
      //   "Authorization",
      //   "Basic " + base64.encode(email + ":" + password)
      // );
      const response = await fetch(`${SERVERURL}/maketrade/`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(trade),
      });
      const json = await response.json();
      if (json.error) {
        alert(json.error);
      } else alert("Trade Proposed!");
      props.history.push("/profile/" + player1);
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    //fetchTrade(); // eslint-disable-next-line
  }, []);
  return (
    <>
      <Header />
      {/*conditional rendering: jsx renders before the fetch api completes, so 
        we have to tell react to render only this, after the fetch api completes by adding the condition
        that the state variable trade exists*/}
      <div style={{ width: "100%", display: "inline-block" }}>
        <div style={{ float: "left", marginRight: "50px" }}>
          {player1} 's cards
          {player1cards.map((card, cardindex) => (
            <div key={cardindex}>
              <label>
                {card.name}
                <input
                  type="checkbox"
                  value={card.name}
                  onChange={(e) => Player1CardChecked(card, cardindex, e)} // need to use arrow function to access this keyword
                />
              </label>
            </div>
          ))}{" "}
        </div>

        <div style={{ float: "left" }}>
          {player2} 's cards
          {player2cards.map((card, cardindex) => (
            <div key={cardindex}>
              <label>
                {card.name}
                <input
                  type="checkbox"
                  value={card.name}
                  onChange={(e) => Player2CardChecked(card, cardindex, e)}
                  key={cardindex}
                />
              </label>
            </div>
          ))}
          {player2cardsselected.map((card, index) => (
            <div key={index}> {card.name}</div>
          ))}
        </div>
        <br></br>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Link to={`/profile/${player1}`}>return to your profile </Link>
        <button onClick={makeTrade}> Make Trade </button>
      </div>
    </>
  );
};

export default withRouter(MakeTrade);
