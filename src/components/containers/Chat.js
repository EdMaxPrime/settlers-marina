import React, {Component, Fragment} from "react";
import {connect} from "react-redux";

import {subscribeToChat, unsubscribeFromChat, sendChatMessage} from "../../actions";
import {getPlayerNames} from "../../selectors";
import * as ConnectionStatus from "../../store/utilities";

import Status from "../views/Status";
import "../../styles/chat.css"

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newChat: ""
    };
    this.handleComposing = this.handleComposing.bind(this);
    this.sendChat = this.sendChat.bind(this);
  }
  componentDidMount() {
    this.props.setup();
  }
  componentWillUnmount() {
    this.props.cleanup();
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
  handleComposing(event) {
    this.setState({newChat: event.target.value});
  }
  sendChat(event) {
    event.preventDefault();
    this.props.sendChatMessage(this.state.newChat);
    this.setState({newChat: ""});
  }
  senderName(playerID) {
    if(this.props.players[playerID])
      return this.props.players[playerID].nickname;
    return "?";
  }
  render() {
    return (
      <div id="chat-container">
        <h2>Chat</h2>
        <div id="chat-list">
        {this.props.chats.map(function(c, index, history) {
          if(c.type === "msg" && 
            (index == 0 || 
              history[index-1].type !== "msg" || 
              history[index-1].sender !== c.sender)) {
            return (<Fragment key={index}>
              <p className="chat-sender">{this.senderName(c.sender)}</p>
              <p className="chat chat-msg">{c.message}</p>
            </Fragment>);
          }
          return <p key={index} className={"chat chat-"+c.type}>{c.message}</p>
        }, this)}
        </div>
        <form onSubmit={this.sendChat}>
          <input id="chat-input" 
                 type="text" 
                 placeholder="type message here" 
                 value={this.state.newChat}
                 onChange={this.handleComposing} />
        </form>
      </div>  
    );
  }
}

const mapDispatchToProps = function(dispatch) {
  return {
    setup: () => dispatch(subscribeToChat()),
    cleanup: () => dispatch(unsubscribeFromChat()),
    sendChatMessage: (message) => dispatch(sendChatMessage(message))
  };
};

const mapStateToProps = function(state) {
  return {
    chats: state.chat,
    players: state.room.players
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);