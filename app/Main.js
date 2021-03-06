import React, { useState, useReducer, useEffect, Suspense } from "react";
import ReactDOM from "react-dom";
import { useImmerReducer } from "use-immer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CSSTransition } from "react-transition-group";
import Axios from "axios";
Axios.defaults.baseURL = "https://backend-for-react-app-sher.herokuapp.com/" || process.env.BACKENDURL;

import StateContext from "./StateContext";
import DispatchContext from "./DispatchContext";

// My Components
import LoadingDotsIcon from "./components/LoadingDotsIcon";
import Header from "./components/Header";
import HomeGuest from "./components/HomeGuest";
import Home from "./components/Home";
import Footer from "./components/Footer";
import About from "./components/About";
import Terms from "./components/Terms";
const CreatePost = React.lazy(() => import("./components/CreatePost"));
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"));
import FlashMessages from "./components/FlashMessages";
import Profile from "./components/Profile";
import EditPost from "./components/EditPost";
import NotFound from "./components/NotFound";
const Search = React.lazy(() => import("./components/Search"));
const Chat = React.lazy(() => import("./components/Chat"));

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexappToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("complexAppToken"),
      username: localStorage.getItem("complexAppUsername"),
      avatar: localStorage.getItem("complexAppAvatar")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  };

  // function ourReducer(state, action) {
  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        // return { loggedIn: true, flashMessages: state.flashMessages };
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case "logout":
        // return { loggedIn: false, flashMessages: state.flashMessages };
        draft.loggedIn = false;
        return;
      case "flashMessage":
        // return { loggedIn: state.loggedIn, flashMessages: state.flashMessages.concat(action.value) };
        draft.flashMessages.push(action.value); //we want to directly modify that array
        return;
      case "openSearch":
        draft.isSearchOpen = true;
        return;
      case "closeSearch":
        draft.isSearchOpen = false;
        return;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "closeChat":
        draft.isChatOpen = false;
        return;
      case "incrementUnreadChatCount":
        draft.unreadChatCount++;
        return;
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0;
        return;
    }
  }

  // const [state, dispatch] = useReducer(ourReducer, initialState);
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);
  // const [loggedIn, setLoggedIn] = useState(Boolearn(localStorage.getItem))
  // const [flashMessages, setFlashMessages] = useState([])
  // function addFlashMessage

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexappToken", state.user.token);
      localStorage.setItem("complexappUsername", state.user.username);
      localStorage.setItem("complexappAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("complexappToken");
      localStorage.removeItem("complexappUsername");
      localStorage.removeItem("complexappAvatar");
    }
  }, [state.loggedIn]); //anytime the state of loggedIn changes, the function will run

  //check if user's token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      //this function won't run when the component renders, but only if request count is at least 1
      //send axios request here
      const ourRequest = Axios.CancelToken.source(); //cancel axios request if this component unmounts in the middle of the request
      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: ourRequest.token }); //will return true if token is value, false if not valid
          if (!response.data) {
            //only if server sends us false (token is not valid)
            dispatch({ type: "logout" });
            dispatch({ type: "flashMessage", value: "Your session has expired, please log in again" });
          }
        } catch (e) {
          console.log("there was a prob or request was cancelled");
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {/* separate it so that components don't have to render unneccessary */}
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route path="/profile/:username/*" element={<Profile />} />
              <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />} />
              <Route path="/post/:id" element={<ViewSinglePost />} />
              <Route path="/post/:id/edit" element={<EditPost />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/about-us" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
              {/* if url doesn't match any of fthe above, show notFound */}
            </Routes>
          </Suspense>
          {/* {state.isSearchOpen ? <Search /> : " "} */}
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            {/* transition will take place in .33 secs, if the code in 'in' is true, it will render the search, else search will be hidden  */}
            {/* unmountOnExit - if 'in' is false, we want to remove the search component from the dom */}
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

ReactDOM.render(<Main />, document.querySelector("#app"));

if (module.hot) {
  module.hot.accept();
}
