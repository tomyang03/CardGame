import React, { useState, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import { withRouter } from "react-router"; // to access the profilename that is being passed
import Autosuggest from "react-autosuggest";
// via the link from Profile.js via state
import Header from "./Header";
import { getAuth } from "./Auth";
const { SERVERURL } = require("./Config");

const SearchFriend = (props) => {
  const [value, setValue] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const history = useHistory();
  const { user: username } = history.location.state; // get the username from the Button of the logged in user same as getAuth.name

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${SERVERURL}/profiles`);
      console.log(response);
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const json = await response.json();
      console.log(json);

      // prof: we don't want the user to add friend to him or herself, extra variable prof
      // to store the profiles
      const prof = json.profiles.filter(
        (profile) => profile.name !== getAuth().name
      );

      setProfiles(prof);
      // optional code: save the names in a temporary array and set it
      //const names = json.profiles.map((profile) => profile.name);
      //setSuggestions(names); // set the suggestions
    } catch (error) {
      console.log(error);
    }
  };

  // Teach Autosuggest how to calculate suggestions for any given input value.
  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : profiles.filter(
          (profile) =>
            profile.name.toLowerCase().slice(0, inputLength) === inputValue
        );
  };

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  const getSuggestionValue = (suggestion) => suggestion.name;

  const onChange = (event, { newValue }) => {
    console.log("newValue", newValue);
    setValue(newValue);
  };
  const sendFriendRequest = async (name) => {
    try {
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      // headers.append(
      //   "Authorization",
      //   "Basic " + base64.encode(email + ":" + password)
      // );
      const response = await fetch(`${SERVERURL}/sendfriendrequest`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ proposer: username, receiver: name }),
      });
      const json = await response.json();
      if (json.error) {
        //if error message exists, meaning players are already friends,display error message
        alert(json.error);
      } else alert("friend request sent !");
      props.history.push("/profile/" + username);
    } catch (error) {
      alert(error);
    }
  };

  // conditional rendering inside lambda function
  // const renderSuggestion = (suggestion) =>
  //   getAuth().name != suggestion.name && (
  //     <button onClick={() => sendFriendRequest(suggestion.name)}>
  //       {suggestion.name}
  //     </button>
  //   );

  const renderSuggestion = (suggestion) => (
    <button onClick={() => sendFriendRequest(suggestion.name)}>
      {suggestion.name}
    </button>
  );
  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  // Autosuggest will call this function every time you need to clear suggestions.
  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  useEffect(() => {
    fetchFriends(); // eslint-disable-next-line
  }, []);

  // Autosuggest will pass through all these props to the input.
  const inputProps = {
    placeholder: "Type your friend's name",
    value,
    onChange: onChange,
  };

  return (
    <>
      <Header />
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />

      <Link to={`/profile/${username}`}>return to profile </Link>
    </>
  );
};

export default withRouter(SearchFriend);
