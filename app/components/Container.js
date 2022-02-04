//creating a reusable container to make sure widths in all pages are the same
import React, { useEffect } from "react";

function Container(props) {
  return (
    <>
      <div className={"container py-md-5 " + (props.wide ? "" : "container--narrow")}>{props.children}</div>
    </>
  );
}

export default Container;
