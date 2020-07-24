import axios from "axios";
import * as Status from "./index";
import { getRoomData } from "./room";

/********************************* ACTIONS ***********************************/

const CHAT = "CHAT";
const CLEAR_CHAT = "CLEAR_CHAT";

// ACTION CREATORS
/**
 * This should be an event listener on socketio "chat" event. This will dispatch
 * a chat event to the redux store.
 */
function appendChat(type, message, sender) {
  appendChat.dispatch({
    type: CHAT,
    payload: {
      type: type,
      message: message,
      sender: sender
    }
  });
}

/********************************* THUNKS ***********************************/

/**
 * This should be called once when you want to start receiving chat events
 */
export function subscribeToChat() {
  return function(dispatch, getStore, client) {
    appendChat.dispatch = dispatch;
    client.on("chat", appendChat);
  }
}

/**
 * This should be called when you don't want to receive chat events anymore
 */
export function unsubscribeFromChat() {
  return function(dispatch, getStore, client) {
    client.off("chat", appendChat);
  }
}

export function sendChatMessage(message) {
  return function(dispatch, getStore, client) {
    client.emit("chat", getStore().room.id, message);
  }
}

/**
 * Use this to erase chat history.
 */
export function clearChat() {
  return { type: CLEAR_CHAT };
}

/********************************* REDUCER ***********************************/
const initialState = [];

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case CHAT:
      return state.concat(action.payload);
    case CLEAR_CHAT:
      return [];
    case "RESET":
      return initialState;
    default:
      return state;
  }
}