import React from "react";
import Login from "./Login";
import Logout from "./Logout";
import Profile from "./Profile";
import Card from "./Card";
import Trade from "./Trade";
import Request from "./Request";
import SearchFriend from "./SearchFriend";
import MakeTrade from "./MakeTrade";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import GlobalStateProvider from "./Context.js";
import "./App.css";
import PrivateRoute from "./PrivateRoute";
import Register from "./Register";

function App() {
  return (
    <GlobalStateProvider>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" render={() => <Login />} />
          <Route exact path="/login" render={() => <Login />} />
          <Route exact path="/register" render={() => <Register />} />
          <Route exact path="/logout" render={() => <Logout />} />
          <PrivateRoute
            exact
            path="/profile/:name"
            render={() => <Profile />}
          />
          <PrivateRoute exact path="/card/:cardname" render={() => <Card />} />
          <PrivateRoute exact path="/trade/:_id" render={() => <Trade />} />
          <PrivateRoute
            exact
            path="/maketrade/:name"
            render={() => <MakeTrade />}
          />
          <PrivateRoute exact path="/request/:_id" render={() => <Request />} />
          <PrivateRoute exact path="/search" render={() => <SearchFriend />} />
        </Switch>
      </BrowserRouter>
    </GlobalStateProvider>
  );
}

export default App;
