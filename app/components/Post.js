import React, { useEffect } from "react";
import { Link } from "react-router-dom";

//the card for post. we keep having to repeat this code in different locations: Home.js, Search.js, ProfilePosts.js
function Post(props) {
  const post = props.post;
  const date = new Date(post.createdDate);
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`; //date are 0 based
  return (
    //when looping through arrays and displaying each one, do give each one a unique key
    <Link onClick={props.onClick} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
      <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong> by {!props.noAuthor && <>{post.author.username}</>} on
      <span className="text-muted small">{dateFormatted} </span>
    </Link>
  );
}

export default Post;
