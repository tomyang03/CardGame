import React, { useState, useEffect, Fragment } from "react";
//import { getAuth } from "./Auth";
import { useParams, Link } from "react-router-dom";
import { withRouter } from "react-router"; // to access the profilename that is being passed
// via the link from Profile.js via state
import Header from "./Header";
const { SERVERURL } = require("./Config");

const Trade = (props) => {
  console.log(props);
  console.log(props.location.state);
  const [trade, setTrade] = useState();
  const [username] = useState(props.location.state.profilename);
  //setUsername(props.location.state.profilename);
  let { _id } = useParams(); //trade id

  const fetchTrade = async () => {
    try {
      const response = await fetch(`${SERVERURL}/trade/${_id}`);
      console.log(response);
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const json = await response.json();
      console.log(json);

      setTrade(json.trade);
    } catch (error) {
      console.log(error);
    }
  };

  const acceptTrade = async () => {
    try {
      // let headers = new Headers();
      // headers.append("Content-Type", "application/json");
      // headers.append(
      //   "Authorization",
      //   "Basic " + base64.encode(email + ":" + password)
      // );
      const response = await fetch(`${SERVERURL}/accepttrade/${_id}`, {
        method: "GET",
        //headers: headers,
        //body: JSON.stringify({}),
      });
      const json = await response.json();
      if (json.error) {
        //if error message exists, meaning players are already friends,display error message
        alert(json.error);
      } else alert("trade accepted !");
      props.history.push("/profile/" + username);
    } catch (error) {
      alert(error);
    }
  };
  const rejectTrade = async () => {
    try {
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      // headers.append(
      //   "Authorization",
      //   "Basic " + base64.encode(email + ":" + password)
      // );
      const response = await fetch(`${SERVERURL}/rejecttrade/${_id}`, {
        method: "DELETE",
        headers: headers,
      });
      const json = await response.json();
      if (json.msg) {
        alert(json.msg); // send alert message from backend
      }
      props.history.push("/profile/" + username);
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    fetchTrade(); // eslint-disable-next-line
  }, []);
  return (
    <>
      <Header />
      {/*conditional rendering: jsx renders before the fetch api completes, so 
        we have to tell react to render only this, after the fetch api completes by adding the condition
        that the state variable trade exists*/}
      {trade && (
        <div>
          <span>
            {"player1"} : {trade.player1}
          </span>
          <br></br>
          <span>
            {"player2"} : {trade.player2}
          </span>{" "}
          <br></br>
          <span>
            {"player1cards"} :{" "}
            {trade["player1cards"].map((card, cardindex) => (
              <Link
                to={{
                  pathname: `/card/${card.name}`,
                  state: { profilename: username },
                }}
                key={cardindex}
              >
                {" "}
                {card.name}
                {cardindex < trade["player1cards"].length - 1 && ","}{" "}
                {/*conditional rendering for comma*/}
              </Link>
            ))}{" "}
          </span>
          <br></br>
          <span>
            {"player2cards"} :{" "}
            {trade["player2cards"].map((card, cardindex) => (
              <Link
                to={{
                  pathname: `/card/${card.name}`,
                  state: { profilename: username },
                }}
                key={cardindex}
              >
                {" "}
                {card.name}{" "}
                {cardindex < trade["player2cards"].length - 1 && ","}
              </Link>
            ))}
            {/* if I am logged in as John and John 
            is the receiver of the trade ie player2, then he 
             gets 2 additional buttons, to accept or reject trade */}
            {username === trade.player2 && (
              <Fragment>
                <button onClick={acceptTrade}>Accept Trade!</button>
                <button onClick={rejectTrade}>Reject Trade!</button>
              </Fragment>
            )}
          </span>{" "}
          <br></br>
        </div>
      )}
      <Link to={`/profile/${username}`}>return to profile </Link>
    </>
  );
};

export default withRouter(Trade);
