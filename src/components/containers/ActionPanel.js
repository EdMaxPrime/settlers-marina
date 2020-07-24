import React, {Component} from "react";
import {connect} from "react-redux";

import {leaveRoom, nextTurn, skipTurn} from "../../actions";
import {amIHost, amIPlaying} from "../../selectors";

class ActionPanel extends Component {
  constructor(props) {
    super(props);
    this.leaveGame = this.leaveGame.bind(this);
  }
  leaveGame() {
    this.props.leaveGame();
  }
  render() {
    const {host, playing, leaveGame, nextTurn, skipTurn} = this.props;
    return (
      <div>
        <h2>Actions</h2>
        <button onClick={leaveGame}>Leave Game</button>
        <button onClick={nextTurn} disabled={!playing}>End Turn</button>
        <button onClick={skipTurn} disabled={!host}>Skip</button>
      </div>);
  }
}

const mapStateToProps = state => {
  return {
    host: amIHost(state),
    playing: amIPlaying(state)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    leaveGame: () => dispatch(leaveRoom()),
    nextTurn: () => dispatch(nextTurn()),
    skipTurn: () => dispatch(skipTurn())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionPanel);