import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import { Link } from "react-router-dom";
import LoadingDotsIcon from "./LoadingDotsIcon";

function ProfilePosts() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true); //is axios request still loading the data? as long as its true (still loading), we want to load an animated loading icon
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await Axios.get(`profile/${username}/posts`);
        console.log(response.data);
        setPosts(response.data); //set the array of posts as the posts variable
        setIsLoading(false);
      } catch (e) {
        console.log("there was a problem");
      }
    }
    fetchPosts();
  }, []); //we only want to run this when component first renders

  if (isLoading) return <LoadingDotsIcon />;

  return (
    <div className="list-group">
      {posts.map(post => {
        const date = new Date(post.createdDate);
        const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; //date are 0 based
        return (
          //when looping through arrays and displaying each one, do give each one a unique key
          <Link key={post._id} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong> on
            <span className="text-muted small">{dateFormatted} </span>
          </Link>
        );
      })}
    </div>
  );
}

export default ProfilePosts;
