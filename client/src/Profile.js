import React, { useState, useEffect, useContext, Fragment } from "react";
import { getAuth } from "./Auth";
import { Link, useParams } from "react-router-dom";
import { withRouter } from "react-router";
import { GlobalStateContext } from "./Context";
import Header from "./Header";
const { SERVERURL } = require("./Config");

const Profile = (props) => {
  console.log(props);
  const [profile, setProfile] = useState();
  const { name } = useParams(); // extra variable to fetch the profile from the link that was clicked on ie if I clickd on Bob's Link, fetch his profile
  const username = getAuth().name; // username: the name of the person who logged in
  const context = useContext(GlobalStateContext);

  // cannot put this code here: it will cause a warning, cannot set variables while rendering,
  // this code belongs in the useEffect
  // if the link that I clicked on is John (name), and I am logged in as John (username)
  // if (name === username) {
  //   console.log("player1");
  //   context.player1.set(username); // set name for player1
  // } else {
  //   console.log("player2");
  //   context.player2.set(name); // set name for player2
  // }

  const redirectToProfile = (e) => {
    props.history.push("/profile/" + e.target.id); // redirect to friend's profile
  };

  const searchFriends = (e) => {
    props.history.push("/search/", { user: username }); // redirect to friend's profile and pass extra data the username to the button
    // window.location.reload(false); as it causes problem on netlify by making a servercall to /search, a route that does not exists
    //window.location.reload(false); // refresh page to get the updated information
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${SERVERURL}/profile/${name}`);
      console.log(response);
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const json = await response.json();
      setProfile(json.profile);
      //set the player1cards to the context, notice we have to use json.profile and not the state variable profile
      // because setProfile is an asynchronous function and takes time to process
      // if the link that I clicked on is John (name), and I am logged in as John (username)
      if (name === username) {
        console.log("player1cards");
        context.player1cards.set(json.profile.cards); // set the player1cards context
      } else {
        console.log("player2cards");
        context.player2cards.set(json.profile.cards); // else set player2cards context
      }
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect gets called after rendering depending on what I have provided as [name]
  useEffect(() => {
    console.log("useffect", name);
    if (name === username) {
      console.log("player1");
      context.player1.set(username); // set name for player1
    } else {
      console.log("player2");
      context.player2.set(name); // set name for player2
    }
    fetchProfile(); // eslint-disable-next-line
  }, [name]); // refresh based on name, if I change the profile name, refresh
  return (
    <>
      <Header />
      <br></br>
      <hr></hr>
      {"Cards"} <br></br>
      {profile &&
        profile.cards.map((card, index) => (
          <Link
            to={{
              pathname: `/card/${card.name}`,
              state: { profilename: name },
            }}
            key={index}
          >
            {" "}
            {card.name}
            <br></br>
          </Link>
        ))}
      {profile && username === profile.name && (
        <Fragment>
          <br></br>
          <hr></hr>
          {"Trades"} <br></br>
        </Fragment>
      )}
      {profile &&
        username === profile.name &&
        profile.trades.map((trade, index) => (
          <Link
            to={{
              pathname: `/trade/${trade._id}`,
              state: { profilename: name },
            }}
            key={index}
          >
            {" "}
            {trade._id}
            <br></br>
          </Link>
        ))}
      {profile && username === profile.name && (
        <Fragment>
          <br></br>
          <hr></hr>
          {"Friends"} <br></br>
        </Fragment>
      )}
      {profile &&
        username === profile.name &&
        profile.friends.map((friend, index) => (
          <Link
            to={{
              pathname: `/profile/${friend}`,
              state: { profilename: name },
            }}
            key={index}
            onClick={redirectToProfile}
            value={friend}
            id={friend}
          >
            {friend}
            <br></br>
          </Link>
        ))}
      {profile && username === profile.name && (
        <Fragment>
          <br></br>
          <hr></hr>
          {"Friend Requests"} <br></br>
        </Fragment>
      )}
      {profile &&
        username === profile.name &&
        profile.requests.map((req, index) => (
          <Link
            to={{
              pathname: `/request/${req._id}`,
              state: { profilename: name },
            }}
            key={index}
          >
            {" "}
            {/*if I am the proposer , only display to ,
             *if I am the receiver , only display from,*/}
            {name === req.proposer ? `to ${req.receiver}` : ""}
            {name === req.receiver ? `from ${req.proposer}` : ""}
            <br></br>
          </Link>
        ))}
      <br></br>
      <hr></hr>
      {/*if I am logged in as John and I am viewing my own profile, then display the Add New Friend Button*/}
      {profile && username === profile.name && (
        <Fragment>
          <button
            onClick={searchFriends}
            style={{ width: "50%", height: "30px" }}
          >
            Add New Friend
          </button>
          <br></br>
          <hr></hr>
        </Fragment>
      )}
      {/*if I am logged in as John and I am viewing my some other player's profile, then display make trade button*/}
      {profile && username !== profile.name && (
        <Link to={`/maketrade/${profile.name}`}>make trade</Link>
      )}
      <br></br>
      <hr></hr>
      {/*if I am logged in as John and I am viewing my some other player's profile, then display Return to your propfile*/}
      {profile && username !== profile.name && (
        <Link to={`/profile/${username}`}>Return to your profile</Link>
      )}
      {/* <br></br> // optional divs for testing context ie store
      the key={index} belongs to the parent component should be put inside Fragment ie
      <Fragment key={index}> because it is the parent component, otherwise we would get a warning message 
      <hr></hr>
      {"player1cards"}
      {context.player1cards.get &&
        context.player1cards.get.map((card, index) => (
          <Fragment>
            {" "}
            <div key={index}>{card.name}</div>
          </Fragment>
        ))}
      <br></br>
      <hr></hr>
      {"player2cards"}
      {context.player2cards.get &&
        context.player2cards.get.map((card, index) => (
          <Fragment>
            {" "}
            <div key={index}>{card.name}</div>
          </Fragment>
        ))} */}
    </>
  );
};

export default withRouter(Profile);
