import React from "react";

import "../../styles/card.css";

/**
 * Props:
 * @title {string}  bolded title text above description
 * @image {string}  url of an image to show above title
 * @body  {string}  description text for this card. Can be HTML.
 * @action {string} button text
 * @onAction {function}  event handler for the button
 */
function Card(props) {
  return (
  <div className="card">
    {props.image && <img src={props.image} className="card-image" alt="alt" />}
    <div className="card-body">
      <h4 className="card-title">{props.title}</h4>
      <p className="card-text">{props.body}</p>
      {props.action && <button onClick={props.onAction} disabled={props.disabled}>
                        {props.action}
                        </button>}
    </div>
  </div>);
}

export default Card;