import React from "react";
import { Route } from "react-router-dom";
import Forbidden from "./Forbidden";
import { getAuth } from "./Auth";

const PrivateRoute = ({ render, ...options }) => {
  console.log("PrivateRoute");
  console.log(getAuth().isAuthenticated);

  const isAuth = getAuth().isAuthenticated;
  const LastComponent = isAuth ? render : () => <Forbidden />;
  return <Route {...options} render={LastComponent} />;
};

export default PrivateRoute;
