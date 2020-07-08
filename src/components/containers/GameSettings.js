import React, {Component} from "react";
import {connect} from "react-redux";

import {subscribeToSettings, unsubscribeFromSettings, nextTurn} from "../../actions";
import {amIHost} from "../../selectors";

import "../../styles/menu.css"

class GameSettings extends Component {
  constructor(props) {
    super(props);
    this.handleMaxPlayers = this.handleMaxPlayers.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  /** React Lifecycle method
   * This will be called once, after the constructor, before first render.
   */
  componentDidMount() {
    this.props.setup();
  }
  /** React Lifecycle method
   * This will be called once, no more renders after this. Destructor.
   */
  componentWillUnmount() {
    this.props.cleanup();
  }
  /**
   * Event handler for maximum players allowed
   */
  handleMaxPlayers(event) {
    this.props.setMaxPlayers(event.target.value);
  }
  /**
   * Event handler for closing this menu and beginning the game. Parent
   * container will close this menu and show the actual game.
   */
  handleSubmit() {
    console.log("Button clicked, starting game");
    this.props.beginGame();
  }
  render() {
    return (
      <div className="menu-container">
        <h2>Settings</h2>
        <button 
          className="btn-action" 
          onClick={this.handleSubmit}
          disabled={!(this.props.host)}
        >
          Begin Game
        </button>
      </div>
      );
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    setup: () => dispatch(subscribeToSettings()),
    cleanup: () => dispatch(unsubscribeFromSettings()),
    beginGame: () => dispatch(nextTurn())
  };
};

const mapStateToProps = function(state) {
  return {
    host: amIHost(state)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(GameSettings);