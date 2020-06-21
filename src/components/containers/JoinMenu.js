import React, {Component} from "react";
import {connect} from "react-redux";

import {createRoom, requestJoinRoom} from "../../actions";
import * as ConnectionStatus from "../../store/utilities";

import Status from "../views/Status";
import "../../styles/menu.css"

class JoinMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      joinCode: ""
    };
    this.handleJoinCodeChange = this.handleJoinCodeChange.bind(this);
    this.handleJoinRequest = this.handleJoinRequest.bind(this);
  }
  /** React Lifecycle method 
   * This will be called after the redux store gets updated and the page has
   * re-rendered. Tell parent App to redirect to game page once a connection
   * has been established.
  */
  componentDidUpdate(prevProps, prevState) {
    if(this.props.playerStatus === ConnectionStatus.CONNECTED) {
      this.props.changeView("game");
    }
  }
  handleJoinCodeChange(event) {
    this.setState({joinCode: event.target.value});
  }
  handleJoinRequest() {
    this.props.requestJoinRoom(this.state.joinCode);
  }
  render() {
    return (
      <div className="menu-container">
        <div>
          <label htmlFor="joinCode">Enter your friend's join code</label>
          <input type="text" id="joinCode" onChange={this.handleJoinCodeChange} />
          <button onClick={this.handleJoinRequest}>Join</button>
          <Status text={this.props.playerStatusMsg}
                  type={this.props.playerStatus}
                  hideStatus="success" />
        </div>
        <p>Or...</p>
        <button onClick={this.props.handleCreateGame}>Create Game</button> 
      </div>
      );
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    handleCreateGame: () => dispatch(createRoom()),
    requestJoinRoom: (joinCode) => dispatch(requestJoinRoom(joinCode))
  };
};

const mapStateToProps = function(state) {
  return {
    playerStatus: state.user.status,
    playerStatusMsg: state.user.message
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(JoinMenu);