import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { withRouter } from "react-router"; // to access the profilename that is being passed
// via the link from Profile.js via state
import Header from "./Header";
const { SERVERURL } = require("./Config");

const Card = (props) => {
  console.log(props);
  console.log(props.location.state);
  const [card, setCard] = useState();
  const [username] = useState(props.location.state.profilename);
  //setUsername(props.location.state.profilename);
  let { cardname } = useParams(); //cardname

  const fetchCard = async () => {
    try {
      const response = await fetch(`${SERVERURL}/card/${cardname}`);
      console.log(response);
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const json = await response.json();
      console.log(json);

      setCard(json.card);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCard(); // eslint-disable-next-line
  }, []);
  return (
    <>
      <Header />
      {/*list out all the properties and their values for each card such as name, artist. some 
cards have additional properties such as Spellpower and other cards don't. we make use of the 
the built in libraries Object.keys to take care of it*/}
      {card &&
        Object.keys(card).map((property, index) => (
          <span key={index}>
            {property} : {card[property]}
            <br></br>
          </span>
        ))}
      <Link to={`/profile/${username}`}>return to profile </Link>
    </>
  );
};

export default withRouter(Card);
