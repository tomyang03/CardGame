import React from "react";
import "./App.css";
import { signOut } from "./Auth";
import { withRouter } from "react-router";
const { SERVERURL } = require("./Config");

function Logout(props) {
  const SignOut = () => {
    signOut();
    props.history.push("/login");
  };

  return (
    <>
      <div className="bounds">
        <h1>Log Out</h1>
        <p>Are u sure you want to log out? </p>
        <button className="button" type="button" onClick={() => SignOut()}>
          Log Out
        </button>
      </div>
    </>
  );
}

export default withRouter(Logout);
