import React from "react";

//import "../../styles/bootstrap-grid.min.css";
/*<div className="bootstrap-container">
      <div className="container-fluid">
        <div className="row">
          {props.children}
        </div>
      </div>
    </div>*
/**
 * No props, just children
 * Children should be Card objects
*/
function CardList(props) {
  console.log(props);
  return (
    <div className="card-list">{props.children}</div>
    );
}

export default CardList;