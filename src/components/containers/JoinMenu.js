import React, {Component} from "react";
import "../../styles/menu.css"

class JoinMenu extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="menu-container">
        <div>
          <label htmlFor="joinCode">Enter your friend's join code</label>
          <input type="text" id="joinCode" onChange={this.handleJoinCodeChange} />
          <button onClick={this.handleJoinRequest}>Join</button>
        </div>
        <p>Or...</p>
        <button>Create Game</button> 
      </div>
      );
  }
}

export default JoinMenu;