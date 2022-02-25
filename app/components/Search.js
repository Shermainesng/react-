import React, { useEffect, useContext } from "react";
import DispatchContext from "../DispatchContext";
import { useImmer } from "use-immer";
import Axios from "axios";
import { Link } from "react-router-dom";
import Post from "./Post";

function Search() {
  const appDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    //similar function as useState but better as we can load 5 properties at once and update any of them
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0
  });

  // when we click escape, we can exit the search bar too (nth to do w react, its a generic web browser way)
  //when this component first renders, browser will listen to any key on your keyboard. we dw it to keep running even after we click the x of the search bar.
  //thus need to clean up after ourselves. in useeffect we can return a cleanup function that will run when the component unmounts
  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler);
    return () => document.removeEventListener("keyup", searchKeyPressHandler);
  }, []);

  function searchKeyPressHandler(e) {
    // escape button has a keycode of 27
    if (e.keyCode == 27) {
      appDispatch({ type: "closeSearch" });
    }
  }

  function handleInput(e) {
    const value = e.target.value;
    setState(draft => {
      //we can directly mutate the state of draft
      draft.searchTerm = value; //now we have whatever the user's input is in state
    });
  }

  //only if user stops typing for awhile, then we'll send the request to get the desired results
  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        //give user the impression that something is loading
        draft.show = "loading";
      });
      const delay = setTimeout(() => {
        // console.log(state.searchTerm); //the input that user types
        setState(draft => {
          draft.requestCount++;
        });
      }, 750); //function i want to run, how many ms i want to wait before running said function
      //return a cleanup function
      return () => clearTimeout(delay);
    } else {
      setState(draft => {
        draft.show = "neither";
      });
    }
    // console.log(state.searchTerm); //console.log will log every change in the input field, but we wouldn't want to flood the backend server with so many queries
  }, [state.searchTerm]);

  //when user types something, the delay function will run. but when user types something again, the previous delay will be cleaned up and it runs again
  //the function in useEffect will only run after 3000s (so if user types fast, we won't be sending so many request to the server instead of letter by letter)

  useEffect(() => {
    if (state.requestCount) {
      //this function won't run when the component renders, but only if request count is at least 1
      //send axios request here
      const ourRequest = Axios.CancelToken.source(); //cancel axios request if this component unmounts in the middle of the request
      async function fetchResults() {
        try {
          const response = await Axios.post("/search", { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token }); //URL to send request to, any data we want to send along (we can give an object),  object where we provide a cancel token in case the request has to be cancelled
          //returns us with an array of post objects that match the searchTerm!
          console.log(response.data);
          setState(draft => {
            draft.results = response.data;
            draft.show = "results";
          });
        } catch (e) {
          console.log("there was a prob or request was cancelled");
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.requestCount]);

  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={() => appDispatch({ type: "closeSearch" })} className="close-live-search">
            {/* close the search bar by clicking on the x */}
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          {/* conditional classes */}
          <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : "")}></div>
          <div className={"live-search-results " + (state.show == "results" ? "live-search-results--visible" : "")}>
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)
                </div>
                {/* loop through our results array and display each result in a card */}
                {state.results.map(post => {
                  {
                    /* const date = new Date(post.createdDate);
                  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; //date are 0 based
                  return (
                    //when looping through arrays and displaying each one, do give each one a unique key
                    <Link onClick={() => appDispatch({ type: "closeSearch" })} key={post._id} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
                      <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong> by {post.author.username} on
                      <span className="text-muted small">{dateFormatted} </span>
                    </Link>
                  ); */
                  }
                  return <Post post={post} key={post._id} onClick={() => appDispatch({ type: "closeSearch" })} />;
                })}
              </div>
            )}
            {!Boolean(state.results.length) && <p className="alert alert-danger text-center shadow-sm">Sorry, we could not find any results for that search</p>}
          </div>
        </div>
      </div>
    </>
  );
}

export default Search;
