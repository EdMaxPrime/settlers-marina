import Status from "./index";
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

export function joinRoom(socket, joinCode) {
  return function(dispatch) {
    dispatch(setStatus(Status.CONNECTING, "Joining Game"));
    socket.emit("request_join", joinCode, (joined, playerID) => {
      if(joined) {
        dispatch(setStatus(Status.CONNECTED, "Loading Players"));
        dispatch(updatePlayer(playerID));
        dispatch(getRoomData(joinCode));
      } else {
        dispatch(setStatus(Status.ERROR, "Couldn't join game. The game may be full, or it may have already started, or you may have mistyped the code."));
      }
    });
  };
}

/********************************* REDUCER ***********************************/
const initialState = {
  status: Status.DISCONNECTED,
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