import React, { Component, Fragment } from 'react';
import {connect} from "react-redux";
import {connect as openConnection, disconnect} from "../../websocket";

import Navbar from "../views/Navbar"
import JoinMenu from "./JoinMenu";
import GameLayout from "./GameLayout";
import '../../styles/App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "main" //main menu, connecting, creating, lobby, game
    };
    this.props.dispatch({type:"initial"})
    //event handlers need the correct value of "this" bound to them
    this.handleViewChange = this.handleViewChange.bind(this);
  }
  handleViewChange(view) {
    console.log("changing view: " + view);
    this.setState({view: view});
  }
  /* React Lifecycle Method. Resources should be opened here. */
  componentDidMount() {
    openConnection();
  }
  /* React Lifecycle Method. Resources should be cleaned up here. */
  componentWillUnmount() {
    disconnect();
  }
  render() {
    return (
      <div className="App">
        <Navbar />
        {this.state.view === "main" && (
          <JoinMenu changeView={this.handleViewChange} />
        )}
        {this.state.view === "game" && (
          <GameLayout changeView={this.handleViewChange} />
        )}
      </div>
    );
  }
}

export default connect()(App);
