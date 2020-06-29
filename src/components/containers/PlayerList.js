import React, {Component} from "react";
import {connect} from "react-redux";

import {filterActivePlayers, computeTurnNow} from "../../selectors";
import * as ConnectionStatus from "../../store/utilities";

import "../../styles/playerList.css"

class PlayerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newName: "",
      newColor: ""
    };
  }
  render() {
    return (
      <div className="player-list">
        <h2>Players</h2>
        <table>
          <tbody>
          {this.props.players.map(function(player){
            return (
            <tr key={"player-"+player.player_id}>
              <td>{(player.player_id === this.props.current) && ">>>"}</td>
              <td><span className={"player-icon player-"+player.color}></span></td>
              <td>{player.nickname}</td>
            </tr>);
          }, this)}
          </tbody>
        </table>
      {/*Player name change here*/}
      </div>
      );
  }
}

const mapStateToProps = function(state) {
  return {
    players: filterActivePlayers(state),
    current: computeTurnNow(state)
  };
};

export default connect(mapStateToProps)(PlayerList);