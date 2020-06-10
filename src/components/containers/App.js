import React, { Component, Fragment } from 'react';
import io from "socket.io-client";
import '../../styles/App.css';

//global variable to store our client's connection to server
let socket;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: "main", //main menu, connecting, creating, lobby, game
      joinCode: ""
    };
    //setStatus(DISCONNECTED)
    console.log("connecting");
    socket = io("http://localhost:3001/settlers", {
      rejectUnauthorized: false
    });
    socket.on("connection", () => {
      console.log("connected to server");
    });
    socket.on("connect_error", (error) => {
      console.log("Error connecting to socket");
      console.log(error);
    });
    socket.on("reconnect_error", (error) => {
      console.log("Reconnection error");
      console.log(error);
    });
    socket.on("reconnect_attempt", (attempt) => {
      console.log("Attempt " + attempt);
    });
    socket.on("disconnect", () => {
      console.log(socket.id + " disconnecting");
    });
    //event handlers need the correct value of "this" bound to them
    this.handleViewChange = this.handleViewChange.bind(this);
    this.handleJoinRequest = this.handleJoinRequest.bind(this);
    this.handleJoinCodeChange = this.handleJoinCodeChange.bind(this);
  }
  handleViewChange(view) {
    this.setState({view: view});
  }
  handleJoinRequest(event) {
    this.setState({view: "connecting"});
    console.log(this.state.joinCode);
    //setStatus(CONNECTING)
    socket.emit("request_join", this.state.joinCode, (joined, playerID) => {
      console.log("joined: " + joined + " with id: " + playerID);
      //setStatus(CONNECTED) or DISCONNECTED, msg=refused
      //setPlayerID(playerID)
    });
    //getGameInfo() action -> GET request
  }
  handleJoinCodeChange(event) {
    this.setState({joinCode: event.target.value});
  }
  /* React Lifecycle Method. Resources should be cleaned up here. */
  componentWillUnmount() {
    socket.disconnect();
  }
  render() {
    const mainMenu = (
      <Fragment>
        <h1>Settlers of Marina</h1>
        <div>
          <label htmlFor="joinCode">Enter your friend's join code</label>
          <input type="text" id="joinCode" onChange={this.handleJoinCodeChange} />
          <button onClick={this.handleJoinRequest}>Join</button>
        </div>
        <p>Or...</p>
        <button>Create Game</button> 
      </Fragment>
      );
    const connecting = (<h1>Connecting...</h1>);
    const creating = (<h1>Creating Game...</h1>);
    const lobby = (
      <div>Lobby</div>
      );
    let view;
    switch(this.state.view) {
      case "main":
        view = mainMenu;
        break;
      case "connecting":
        view = connecting;
        break;
      case "creating":
        view = creating;
        break;
      case "lobby":
        view = lobby;
      default:
        view = mainMenu; //replace with <Game />
    }
    return (
      <div className="App">{view}</div>
    );
  }
}

export default App;
