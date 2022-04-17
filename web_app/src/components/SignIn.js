import React from "react";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase-config";
import firebase from "firebase/compat/app";
import { useNavigate } from "react-router-dom";

import "react-medium-image-zoom/dist/styles.css";

var firebaseui = require("firebaseui");

const SignIn = (props) => {
  let navigate = useNavigate();

  const uiConfig = {
    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
      if (authResult.additionalUserInfo.isNewUser) {
        props.user.sendEmailVerification();
        navigate();
        return false;
      }
      return true;
    },
    signInSuccessUrl: "/",
    signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
    // Other config options...
  };

  useEffect(() => {
    if (firebaseui.auth.AuthUI.getInstance()) {
      const ui = firebaseui.auth.AuthUI.getInstance();
      ui.start("#firebaseui-auth-container", uiConfig);
    } else {
      var ui = new firebaseui.auth.AuthUI(auth);
      ui.start("#firebaseui-auth-container", uiConfig);
    }
  }, []);

  return (
    <div>
      <div id="firebaseui-auth-container"></div>
    </div>
  );
};

export default SignIn;
