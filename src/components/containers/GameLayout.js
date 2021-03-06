import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

import {subscribeToAnnouncements, unsubscribeFromAnnouncements} from "../../actions";
import * as ConnectionStatus from "../../store/utilities";

import Chat from "./Chat";
import Status from "../views/Status";
import PlayerList from "./PlayerList";
import GameSettings from "./GameSettings";
import ActionPanel from "./ActionPanel";
import TileMap from "./Map";
import Shop from "./Shop";
import "../../styles/gameLayout.css"

class GameLayout extends Component {
  constructor(props) {
    super(props);
    this.handleJoinCodeChange = this.handleJoinCodeChange.bind(this);
    this.handleJoinRequest = this.handleJoinRequest.bind(this);
  }
  /** React Lifecycle method 
   * This will be called after the redux store gets updated and the page has
   * re-rendered. Tell parent App to redirect to game page once a connection
   * has been established.
  */
  componentDidUpdate(prevProps, prevState) {
    if(this.props.gameStatus === ConnectionStatus.DISCONNECTED) {
      this.props.changeView("main");
    }
  }
  componentDidMount() {
    this.props.setup();
  }
  componentWillUnmount() {
    this.props.cleanup();
  }
  handleJoinCodeChange(event) {
    this.setState({joinCode: event.target.value});
  }
  handleJoinRequest() {
    this.props.requestJoinRoom(this.state.joinCode);
  }
  render() {
    return (
      <div className="game-container">
        <div className="text-left">
          <h1 className="game-announcement">{this.props.announcement}</h1>
          <p className="subtle">Join Code: {this.props.joinCode} | {this.props.num_players} players | {this.props.phase}</p>
        </div>
        <div className="columns">
          <div>
            {this.props.phase == "LOBBY"? <GameSettings /> : 
            <Fragment>
              <TileMap />
              <Shop />
            </Fragment>}
          </div>
          <div>
            <PlayerList />
            <ActionPanel />
            <Chat />
          </div>
        </div>
      </div>
      );
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    setup: () => dispatch(subscribeToAnnouncements()),
    cleanup: () => dispatch(unsubscribeFromAnnouncements())
  };
};

const mapStateToProps = function(state) {
  return {
    chats: state.chat,
    gameStatus: state.room.connection.status,
    gameStatusMsg: state.room.connection.message,
    phase: state.room.phase,
    joinCode: state.room.id,
    announcement: state.room.announcement,
    num_players: state.room.num_players
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameLayout);