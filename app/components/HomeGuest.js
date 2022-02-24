import React, { useEffect, useState, useContext } from "react";
import Page from "./Page";
import Axios from "axios";
import { useImmerReducer } from "use-immer";
import { CSSTransition } from "react-transition-group";
import DispatchContext from "../DispatchContext";

function HomeGuest() {
  const appDispatch = useContext(DispatchContext);

  const initialState = {
    username: {
      value: "",
      hasErrors: false,
      message: "", //the error message presented to the user
      isUnique: false,
      checkCount: 0
    },
    email: {
      value: "",
      hasErrors: false,
      message: "", //the error message presented to the user
      isUnique: false,
      checkCount: 0
    },
    password: {
      value: "",
      hasErrors: false,
      message: "" //the error message presented to the user
    },
    submitCount: 0
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case "usernameImmediately": //dispatch the latest value in the form so we can check if its ok
        draft.username.hasErrors = false; //this will run after every value change, so we should now assume that there's no errors yet
        draft.username.value = action.value; //store the user's input in state
        if (draft.username.value.length > 30) {
          draft.username.hasErrors = true;
          draft.username.message = "Username cannot exceed 30 characters";
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          //if the input is no empty and contains alphanumeric (doesn't just contain alphabets and numbers)
          draft.username.hasErrors = true;
          draft.username.message = "Username can only contain letters and numbers";
        }
        return;
      case "usernameAfterDelay": //wait a few seconds before sending the error msg that username has to be > 3 characters (don't want to just send it when user starts typing)
        if (draft.username.value.length < 3) {
          draft.username.hasErrors = true;
          draft.username.message = "Username must be at least 3 characters";
        }
        if (!draft.username.hasErrors && !action.noRequest) {
          //only if username has no errors, then increment check count. we will watch check count for changes to send axios request to check if that username exists in DB
          draft.username.checkCount++;
        }
        return;
      case "usernameUniqueResults":
        if (action.value) {
          draft.username.hasErrors = true;
          draft.username.isUnique = false;
          draft.username.message = "That username is already taken";
        } else {
          draft.username.isUnique = true;
        }
        return;
      case "emailImmediately":
        draft.email.hasErrors = false;
        draft.email.value = action.value;
        return;
      case "emailAfterDelay":
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          //if the input does not match the basic pattern for an email
          draft.email.hasErrors = true;
          draft.email.message = "You must provide a valid email address";
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          //norequest is when we are submitting the form alr (contents hv alr been vetted)
          //only if there aren't any errors then send request to check if email already exists
          draft.email.checkCount++;
        }
        return;
      case "emailUniqueResults":
        if (action.value) {
          //if the axios request send us back a value (means that email alr exists)
          draft.email.hasErrors = true;
          draft.email.isUnique = false;
          draft.email.message = "That email is already being used";
        } else {
          draft.email.isUnique = true;
        }
        return;
      case "passwordImmediately":
        draft.password.hasErrors = false;
        draft.password.value = action.value;
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true;
          draft.password.message = "Password cannot exceed 50 characters";
        }
        return;
      case "passwordAfterDelay":
        if (draft.password.value.length < 12) {
          draft.password.hasErrors = true;
          draft.password.message = "Password must be at least 12 characters";
        }
        return;
      case "submitForm": //we alr checked if fields were unique when user just typed in and waited for a bit, no need to check again upon submitting form
        if (!draft.username.hasErrors && draft.username.isUnique && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) {
          //we are happy with the values and can send an axios request
          draft.submitCount++;
        }
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  //USERNAME FIELD
  //wait for a bit before sending error msg that username is too short and send request to check if it exists already
  useEffect(() => {
    if (state.username.value) {
      const delay = setTimeout(() => dispatch({ type: "usernameAfterDelay" }), 800); //want to wait a bit before sending the error msg that username is too short
      return () => clearTimeout(delay);
    }
  }, [state.username.value]); //don't want to run this when the component first renders,but only if there is a later change in username

  //check with DB to see if username already exists
  useEffect(() => {
    if (state.username.checkCount) {
      const ourRequest = Axios.CancelToken.source(); //cancel axios request if this component unmounts in the middle of the request
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesUsernameExist", { username: state.username.value }, { cancelToken: ourRequest.token }); //URL to send request to, any data we want to send along (we can give an object),  object where we provide a cancel token in case the request has to be cancelled
          dispatch({ type: "usernameUniqueResults", value: response.data });
        } catch (e) {
          console.log("there was a prob or request was cancelled");
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.username.checkCount]);

  //EMAIL FIELD - set delay before checking
  useEffect(() => {
    if (state.email.value) {
      const delay = setTimeout(() => dispatch({ type: "emailAfterDelay" }), 800); //want to wait a bit before sending the error msg that email is too short
      return () => clearTimeout(delay);
    }
  }, [state.email.value]);

  //useEffect to check if email exists in DB
  useEffect(() => {
    if (state.email.checkCount) {
      const ourRequest = Axios.CancelToken.source(); //cancel axios request if this component unmounts in the middle of the request
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesEmailExist", { email: state.email.value }, { cancelToken: ourRequest.token }); //URL to send request to, any data we want to send along (we can give an object),  object where we provide a cancel token in case the request has to be cancelled
          dispatch({ type: "emailUniqueResults", value: response.data });
        } catch (e) {
          console.log("there was a prob or request was cancelled");
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.email.checkCount]);

  //PASSWORD FIELD - set delay before checking
  useEffect(() => {
    if (state.password.value) {
      const delay = setTimeout(() => dispatch({ type: "passwordAfterDelay" }), 800); //want to wait a bit before sending the error msg that password is too short
      return () => clearTimeout(delay);
    }
  }, [state.password.value]);

  //useeffect to send user's inputs to the backend and create an account
  useEffect(() => {
    if (state.submitCount) {
      const ourRequest = Axios.CancelToken.source(); //cancel axios request if this component unmounts in the middle of the request
      async function fetchResults() {
        try {
          const response = await Axios.post("/register", { username: state.username.value, email: state.email.value, password: state.password.value }, { cancelToken: ourRequest.token });
          appDispatch({ type: "login", data: response.data }); //store my username, data etc
          appDispatch({ type: "flashMessage", value: "Congrats, welcome to your new account" });
        } catch (e) {
          console.log("there was a prob or request was cancelled");
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.submitCount]);

  //before sending request to backend to check if it alr exists, we want to run all our validation rules before bothering our server
  //this will trigger all the validations (client-side) before user submit and send data to backend
  function handleSubmit(e) {
    e.preventDefault();
    dispatch({ type: "usernameImmediately", value: state.username.value });
    dispatch({ type: "usernameAfterDelay", value: state.username.value, noRequest: true });
    dispatch({ type: "emailImmediately", value: state.email.value });
    dispatch({ type: "emailAfterDelay", value: state.email.value, noRequest: true });
    dispatch({ type: "passwordImmediately", value: state.password.value });
    dispatch({ type: "passwordAfterDelay", value: state.password.value });
    dispatch({ type: "submitForm" });
    //   try {
    //     await Axios.post("/register", { username, email, password });
    //     console.log("User was successfully created.");
    //   } catch (e) {
    //     console.log("There was an error.");
    //   }
  }

  return (
    <Page title="Welcome!" wide={true}>
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">Remember Writing?</h1>
          <p className="lead text-muted">Are you sick of short tweets and impersonal &ldquo;shared&rdquo; posts that are reminiscent of the late 90&rsquo;s email forwards? We believe getting back to actually writing is the key to enjoying the internet again.</p>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onChange={e => dispatch({ type: "usernameImmediately", value: e.target.value })} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={e => dispatch({ type: "emailImmediately", value: e.target.value })} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={e => dispatch({ type: "passwordImmediately", value: e.target.value })} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit>
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for ComplexApp
            </button>
          </form>
        </div>
      </div>
    </Page>
  );
}

export default HomeGuest;
