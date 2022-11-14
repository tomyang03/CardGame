import React, { useState } from "react";
import { signIn, getAuth } from "./Auth";
import { withRouter } from "react-router";
import Header from "./Header";
const { SERVERURL } = require("./Config");
console.log("SERVERURL", SERVERURL);
//console.log("TEST", process.env.REACT_APP_TEST);

const Register = (props) => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const RegisterUser = async () => {
    try {
      console.log("name");
      console.log(name);
      const user = {
        name: name,
        password: password,
      };

      let headers = new Headers();
      headers.append("Content-Type", "application/json");

      const url = `${SERVERURL}/register`;

      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(user),
      });

      console.log(response);

      const json = await response.json();
      if (json.error) {
        alert(json.error);
        return;
      }
      signIn(name, password);
      alert("registration successful !");
      props.history.push("/profile/" + name);
    } catch (error) {
      console.log(error);
    }
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
      <form id="loginForm">
        <label for="username">username:</label>
        <br />
        <input
          type="text"
          id="username"
          name="username"
          onChange={OnNameChange}
        />
        <br />
        <label for="password">password:</label>
        <br />
        <input
          type="text"
          id="password"
          name="password"
          onChange={OnPasswordChange}
        />
        <br />
        <br />
        <input type="button" onClick={RegisterUser} value="register" />
        <br />
      </form>
    </>
  );
};

export default withRouter(Register);
