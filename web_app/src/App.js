import "react-medium-image-zoom/dist/styles.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";

import Home from "./components/Home";
import SignIn from "./components/SignIn";
import Account from "./components/Account"
import NavBar from "./components/NavBar";
import Lot10  from "./components/Lot10";

import * as ROUTES from "./constants/routes";

import Alert from "@mui/material/Alert";

import { auth } from "./firebase-config";
import { onAuthStateChanged } from "firebase/auth";

function App() {
  const [user, setUser] = useState(undefined);
  const [verified, setVerified] = useState(false);

  onAuthStateChanged(auth, (u) => {
    setUser(u);
    if (u) {
      // user signed in
      console.log("LOGGED IN");
      console.log(u);
      setVerified(u.emailVerified);
    } else {
      // user signed out
      console.log("LOGGED OUT");
    }
  });

  return (
    <div className="App">
      <Router>
        <NavBar user={user} />
        {user && verified && (
          <Alert severity="warning">
            Please verify your email. To send another verification email, click
          </Alert>
        )}
        <div style={{ height: 50 }} />
        <Routes>
          <Route path={ROUTES.HOME} element={<Home />} user={user} />
          <Route path={ROUTES.LOT10} element={<Lot10 />} user={user} />
          <Route path={ROUTES.SIGNIN} element={<SignIn user={user} />} />
          <Route path={ROUTES.ACCOUNT} element={<Account user={user} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
