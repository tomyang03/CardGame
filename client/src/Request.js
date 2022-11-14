import React, { useState, useEffect, Fragment } from "react";
import { getAuth } from "./Auth";
import { useParams, Link } from "react-router-dom";
import { withRouter } from "react-router"; // to access the profilename that is being passed
// via the link from Profile.js via state
import Header from "./Header";
const { SERVERURL } = require("./Config");

const Request = (props) => {
  console.log(props);
  console.log(props.location.state);
  const [request, setRequest] = useState();
  const [username] = useState(props.location.state.profilename); //get the username via the link of the request the user has clicked on
  let { _id } = useParams(); //request id

  const fetchRequest = async () => {
    try {
      const response = await fetch(`${SERVERURL}/request/${_id}`);
      console.log(response);
      if (!response.ok) {
        throw Error(response.statusText);
      }
      const json = await response.json();
      console.log(json);

      setRequest(json.request);
    } catch (error) {
      console.log(error);
    }
  };

  const acceptFriendRequest = async () => {
    try {
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      // headers.append(
      //   "Authorization",
      //   "Basic " + base64.encode(email + ":" + password)
      // );
      const response = await fetch(`${SERVERURL}/acceptfriend/${_id}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify({}),
      });
      const json = await response.json();
      if (json.error) {
        //if error message exists, meaning players are already friends,display error message
        alert(json.error);
      } else alert("friend request accepted !");
      props.history.push("/profile/" + username);
    } catch (error) {
      alert(error);
    }
  };
  const rejectFriendRequest = async () => {
    try {
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      // headers.append(
      //   "Authorization",
      //   "Basic " + base64.encode(email + ":" + password)
      // );
      const response = await fetch(`${SERVERURL}/rejectfriend/${_id}`, {
        method: "DELETE",
        headers: headers,
      });
      const json = await response.json();
      alert("friend request rejected !");
      props.history.push("/profile/" + username);
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    fetchRequest(); // eslint-disable-next-line
  }, []);
  return (
    <>
      <Header />
      {/*conditional rendering: jsx renders before the fetch api completes, so 
        we have to tell react to render only this, after the fetch api completes by adding the condition
        that the state variable request exists*/}
      {request && (
        <div>
          <span>
            {"proposer"} : {request.proposer}
          </span>
          <br></br>
          <span>
            {"receiver"} : {request.receiver}
          </span>{" "}
          <br></br>
          {/* if the current user logged in is the receiver, he get 2 more buttons to 
          reject or accept the friend request*/}
          {username === request.receiver && (
            <Fragment>
              <button onClick={acceptFriendRequest}>
                Accept Friend Request!
              </button>
              <button onClick={rejectFriendRequest}>
                Reject Friend Request!
              </button>
            </Fragment>
          )}
        </div>
      )}
      <Link to={`/profile/${username}`}>return to profile </Link>
    </>
  );
};

export default withRouter(Request);
