import React, { useEffect, useContext, useRef } from "react";
import StateContext from "../StateContext";
import DispatchContext from "../DispatchContext";
import { Link } from "react-router-dom";
import { useImmer } from "use-immer";
import io from "socket.io-client";

function Chat() {
  const socket = useRef(null);
  const chatField = useRef(null); //ref is like a box we can hold values in, and unlike state, we can directly mutate it
  const chatLog = useRef(null);
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: []
  });

  //everytime the chat opens we apply autofocus so we can automatically type
  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus();
      appDispatch({ type: "clearUnreadChatCount" }); //clear the unread chat count on the chat icon when the chat is open
    }
  }, [appState.isChatOpen]);

  function handleFieldChange(e) {
    const value = e.target.value;
    setState(draft => {
      draft.fieldValue = value;
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    //send message to chat server, and add it to our state
    socket.current.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token }); //name of an event type, and object with message and token
    setState(draft => {
      draft.chatMessages.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar }); //add the message to our state array
      draft.fieldValue = ""; //clear out the chat field after i send a message
    });
  }

  //we want our browser to listen to the 'chatFromBrowser' event - run this the first time the component is ran
  useEffect(() => {
    socket.current = io("http://localhost:8080"); //only turn on and off the socket when we need to
    socket.current.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessages.push(message);
      });
    });

    return () => socket.current.disconnect();
  }, []);

  //we want the chat to automatically show the latest messages instead of having to scroll down manually
  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight; //we want it to scroll to the very bottom of its height
    if (state.chatMessages.length && !appState.isChatOpen) {
      //if there is a change in the array of messages and the chat is not open, we want to show unread messages count
      appDispatch({ type: "incrementUnreadChatCount" });
    }
  }, [state.chatMessages]);

  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={() => appDispatch({ type: "closeChat" })} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>

      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              /* template for chats sent by me */
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            );
          }

          return (
            /* template for messages sent by others */
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input value={state.fieldValue} ref={chatField} onChange={handleFieldChange} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  );
}

export default Chat;
