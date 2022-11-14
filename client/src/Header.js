import React from "react";
import { Link } from "react-router-dom";
import { getAuth } from "./Auth";
import "./App.css";

function Header() {
  const loggedInUser = getAuth().name;
  const isAuth = getAuth().isAuthenticated;
  console.log(isAuth);
  console.log(isAuth);
  return (
    <>
      <nav>
        {isAuth && <span> Welcome {loggedInUser} ! </span>}
        <br />
        {!isAuth && (
          <Link to="/login" style={{ marginRight: "20px" }}>
            Sign In
          </Link>
        )}

        {isAuth && (
          <Link to="/logout" style={{ marginRight: "20px" }}>
            Sign Out
          </Link>
        )}

        {!isAuth && (
          <Link to="/register" style={{ marginRight: "20px" }}>
            Sign Up
          </Link>
        )}

        {isAuth && (
          <Link to={"/profile/" + loggedInUser} style={{ marginRight: "20px" }}>
            Profile
          </Link>
        )}
      </nav>
      <hr />
    </>
  );
}

export default Header;
