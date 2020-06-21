import axios from "axios";
import * as Status from "./index";
import { getRoomData } from "./room";

/********************************* ACTIONS ***********************************/

const SET_STATUS = "SET_STATUS";
const SET_PLAYER = "SET_PLAYER";

// ACTION CREATORS
/**
 * Makes an action that will update the status code and message of this slice
 * of the Redux store. Please use it to indicate the progress of some process.
 * Call it before and after an asynchronous action. This will let subscribed
 * components change their state when the status is right.
 * @param statusCode  a constant from StatusCode (index.js)
 * @param message     a string to show the user
 */
function setStatus(statusCode, message) {
  return {
    type: SET_STATUS,
    status: statusCode,
    message: message
  };
}

function updatePlayer(playerID) {
  return {
    type: SET_PLAYER,
    playerID: playerID
  };
}

/********************************* THUNKS ***********************************/

export function requestJoinRoom(joinCode) {
  return function(dispatch) {
    dispatch(setStatus(Status.CONNECTING, "Searching for game..."));
    axios.put(`/api/games/${joinCode}/join`)
    .then((response) => {
      dispatch(joinRoom(joinCode, response.data.player_id));
    })
    .catch((error) => {
      let reason = "";
      if(error.response) {
        reason = ": " + error.response.data;
      }
      dispatch(setStatus(Status.ERROR, "Couldn't join game" + reason));
    });
  }
}

export function joinRoom(joinCode, playerID) {
  console.log(`joinRoom(joinCode=${joinCode}, playerID=${playerID})`);
  return function(dispatch, getStore, client) {
    console.log("join room async thunk");
    dispatch(setStatus(Status.CONNECTING, "Joining game..."))
    client.emit("player_join", joinCode, playerID, (joined, playerID) => {
      if(joined) {
        dispatch(setStatus(Status.CONNECTED, "Loading Players"));
        dispatch(updatePlayer(playerID));
        dispatch(getRoomData(joinCode));
      } else {
        dispatch(setStatus(Status.ERROR, "Couldn't join game. The game may be full, or it may have already started, or you may have mistyped the code."));
      }
    });
  }
}

/********************************* REDUCER ***********************************/
const initialState = {
  status: null,
  message: "",
  playerID: 0
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_STATUS:
      return Object.assign({}, state, {
        status: action.status,
        message: action.message
      });
    case SET_PLAYER:
      return Object.assign({}, state, {
        playerID: action.playerID
      });
    default:
      return state;
  }
}