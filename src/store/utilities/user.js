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

export function requestJoinRoom(joinCode) {
  return function(dispatch, getStore, client) {
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

export function joinRoom(joinCode, playerID) {
  console.log(`joinRoom(joinCode=${joinCode}, playerID=${playerID})`);
  return function(dispatch, getStore, client) {
    console.log("join room async thunk: client: " + client.id);
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