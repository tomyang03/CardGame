import React, { useState } from "react";
import { signIn } from "./Auth";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import Header from "./Header";
const { SERVERURL } = require("./Config");

const Login = (props) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  // function which fetches the user from the db,
  // if the name and password match up, forward to the profile
  const LoginUser = async () => {
    try {
      let base64 = require("base-64");
      let headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append(
        "Authorization",
        "Basic " + base64.encode(name + ":" + password)
      );

      const url = `${SERVERURL}/user/${name}`;

      const response = await fetch(url, {
        method: "GET",
        headers: headers,
      });

      console.log(response);

      const json = await response.json();
      if (json.error) {
        alert(json.error);
        return;
      }
      signIn(name, password);
      props.history.push("/profile/" + name);
    } catch (error) {
      console.log(error);
    }
  };

  const mySubmitHandler = (event) => {
    event.preventDefault();
    LoginUser();
  };

  const OnNameChange = (event) => {
    setName(event.target.value);
  };

  const OnPasswordChange = (event) => {
    setPassword(event.target.value);
  };

  return (
    <>
      <Header />
      <form
        action="/login"
        method="POST"
        id="loginForm"
        onSubmit={mySubmitHandler}
        name={name}
      >
        <label htmlFor="username">username:</label>
        <br />
        <input
          type="text"
          id="username"
          name="username"
          onChange={OnNameChange}
        />
        <br />
        <label htmlFor="password">password:</label>
        <br />
        <input
          type="text"
          id="password"
          name="password"
          onChange={OnPasswordChange}
        />
        <br />
        <br />
        <input type="submit" value="Log in" />
        <br />
      </form>
      <p>
        not a user?
        <Link to="/register" style={{ marginRight: "20px" }}>
          Register Here
        </Link>
      </p>
    </>
  );
};

export default withRouter(Login);
