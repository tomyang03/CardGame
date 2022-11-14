import React from "react";
import { useState } from "react";
import { getAuth } from "./Auth";

export const GlobalStateContext = React.createContext();

/* GlobalStateProvider :
 a component used to persist the authenticated user information in a global state-full component.
*/
const GlobalStateProvider = (props) => {
  const [player1, setPlayer1] = useState(getAuth().name); //player1: the person who initiates the trade
  const [player2, setPlayer2] = useState(""); // player2: the person accepting or rejecting the trade

  const [player1cards, setPlayer1cards] = useState([]); // player1cards: all initial cards for player1
  const [player2cards, setPlayer2cards] = useState([]); // player2cards: all initial cards for player2

  const [player1cardsselected, setPlayer1cardsselected] = useState([]); // player1cardsselected: all cards selected for trade by player1
  const [player2cardsselected, setPlayer2cardsselected] = useState([]); // player2cardsselected: all cards selected for trade by player2

  const store = {
    player1: { get: player1, set: setPlayer1 },
    player2: { get: player2, set: setPlayer2 },
    player1cards: { get: player1cards, set: setPlayer1cards },
    player2cards: { get: player2cards, set: setPlayer2cards },
    player1cardsselected: {
      get: player1cardsselected,
      set: setPlayer1cardsselected,
    },
    player2cardsselected: {
      get: player2cardsselected,
      set: setPlayer2cardsselected,
    },
  };

  return (
    <GlobalStateContext.Provider value={store}>
      {props.children}
    </GlobalStateContext.Provider>
  );
};

export default GlobalStateProvider;
