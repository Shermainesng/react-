import React, { useState, useEffect, useContext } from "react";
import Page from "./Page";
import { useParams } from "react-router-dom";
import Axios from "axios";
import StateContext from "../StateContext";
import ProfilePosts from "./ProfilePosts";

function Profile() {
  const { username } = useParams(); //might return an object with many variables
  const appState = useContext(StateContext);
  const [profileData, setProfileData] = useState({
    profileUsername: "...", //these are keys from the object that the server returns us
    profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
    isFollowing: false,
    counts: { postCount: "", follwerCount: "", followingCount: "" }
  });

  useEffect(() => {
    async function fetchData() {
      //must define another function as can't add async to useEffect. but make sure to call the function
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token }); //also post the current user's token so we can see if user is following this <profile></profile>
        // console.log(response.data);
        setProfileData(response.data);
      } catch (e) {
        console.log("there was a problem");
      }
    }
    fetchData();
  });

  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={profileData.profileAvatar} /> {profileData.profileUsername}
        <button className="btn btn-primary btn-sm ml-2">
          Follow <i className="fas fa-user-plus"></i>
        </button>
      </h2>
      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <a href="#" className="active nav-item nav-link">
          Posts: {profileData.counts.postCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Followers: {profileData.counts.followerCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Following: {profileData.counts.followingCount}
        </a>
      </div>
      <ProfilePosts />
    </Page>
  );
}

export default Profile;
