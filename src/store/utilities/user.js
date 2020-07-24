import axios from "axios";
import * as Status from "./index";
import {getRoomData} from "./room";

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
export function setStatus(statusCode, message) {
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

/**
 * Phase 2 of joining a room. This async action should only be called from
 * requestJoinRoom(). Expects nothing about the state of the user slice. Will
 * modify the user's status, playerID, and then ask the room to begin loading.
 */
function connectToRoom(joinCode) {
  return function(dispatch, getStore, client) {
    console.log(`connectToRoom(joinCode=${joinCode})`);
    client.emit("request_join", joinCode, function(joined, playerID) {
      console.log("connectToRoom() succeeded: " + joined);
      if(joined) {
        dispatch(setStatus(Status.CONNECTED, "You're in!"));
        dispatch(updatePlayer(playerID));
        dispatch(getRoomData(joinCode));
      } else {
        dispatch(setStatus(Status.ERROR, "Couldn't join game: " + playerID));
      }
    });
  };
}

/**
 * This async action is the only way to initiate the process of joining a
 * game. Do not call it more than once until a response is received!
 * On success, phase of joining a game connectToRoom() proceeds. On error, the
 * error status and message will be set HERE and NOT on the room slice.
 * @param joinCode {String}  the unique identifier of the game you're joining
 */
export function requestJoinRoom(joinCode) {
  return function(dispatch, getStore, client) {
    dispatch({type: "RESET"});
    dispatch(setStatus(Status.CONNECTING, "Searching for game..."));
    axios.post(`/api/games/${joinCode}/join`, {
      "socket.io": client.id
    })
    .then((response) => {
      dispatch(connectToRoom(joinCode));
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

/**
 * Ask the server to create a new room/game. The server will respond with:
 *     join_code: (string) the new game's identifier
 *     player_id: (int)    your player id within the game
 * This user should then subscribe to game updates with socketio.
 * Finally, fetch game, map and player data from the database.
 */
export function createRoom() {
  return function(dispatch, getStore, client) {
    dispatch(setStatus(Status.CONNECTING, "Creating game..."));
    axios.post("/api/games/create", {
      "socket.io": client.id
    })
    .then(function(response) {
      console.log("confirmed that room was created: ", response.data);
      dispatch(connectToRoom(response.data.join_code));
    })
    .catch(function(error) {
      dispatch(setStatus(Status.ERROR, "Couldn't create game at this time. Please try later."));
    });
  }
}

/**
 * This is an async action that will cause this player to leave the game. Any
 * remaining data in the redux global store should be considered invalid.
 * Even if you rejoin the same game, all this data will be refreshed anyway.
 * This action can safely be called even when not in a game, nothing happens.
 */
export function leaveRoom() {
  return function(dispatch, getStore, client) {
    client.emit("player_leave", () => {
      dispatch(setStatus(Status.DISCONNECTED, "You left the game " + getStore().room.id));
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
    case "RESET":
      return initialState;
    default:
      return state;
  }
}