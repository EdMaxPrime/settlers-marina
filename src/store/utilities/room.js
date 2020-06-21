import * as Status from "./index";
import { joinRoom } from "./user";
import axios from "axios";

/********************************* ACTIONS ***********************************/

const SET_STATUS = "SET_STATUS";
const UPDATE_ROOM = "UPDATE_ROOM";

// ACTION CREATORS
/**
 * Makes an action that will update the status code and message of this slice
 * of the Redux store. Please use it to indicate the progress of some process.
 * Call it before and after an asynchronous action. This will let subscribed
 * components change their state when the status is right.
 * @param statusCode  a constant from StatusCode (index.js)
 * @param message     a string to show the user
 */
function setRoomStatus(statusCode, message) {
  return {
    type: SET_STATUS,
    status: statusCode,
    message: message
  };
}

function updateRoom(room) {
  return {
    type: UPDATE_ROOM,
    payload: room
  };
}

/********************************* THUNKS ***********************************/

/**
 * This action will refresh data about the room. You can provide the joinCode
 * to specify which room to get information about. If you are already in a
 * game and just want to refresh the game data, this parameter is optional.
 * @param joinCode  the room's identifier
 */
export function getRoomData(joinCode) {
  return function(dispatch, getStore) {
    const id = joinCode || getStore().room.id;
    if(joinCode)
      dispatch(setRoomStatus(Status.CONNECTING, "Loading Game..."));
    axios.get(`/api/games/${id}/info`)
    .then(function(response) {
      if(joinCode) //if connecting for the first time, update status
        dispatch(setRoomStatus(Status.CONNECTED, ""));
      dispatch(updateRoom(response.data));
    })
    .catch(function(error) {
      dispatch(setRoomStatus(Status.ERROR, "Failed to join game"));
    });
  };
}

/**
 * Ask the server to create a new room/game. The server will respond with:
 *     join_code: (string) the new game's identifier
 *     player_id: (int)    your player id within the game
 * This user should then subscribe to game updates with socketio.
 * Finally, fetch game, map and player data from the database.
 */
export function createRoom() {
  return function(dispatch) {
    dispatch(setRoomStatus(Status.CREATING, "Creating game..."));
    axios.post("/api/games/new_game")
    .then(function(response) {
      console.log("confirmed that room was created: ");
      dispatch(joinRoom(response.data.join_code, response.data.player_id));
    })
    .catch(function(error) {
      dispatch(setRoomStatus(Status.ERROR, "Couldn't create game at this time. Please try later."));
    });
  }
}

/********************************* REDUCER ***********************************/
const initialState = {
  connection: {
    status: Status.DISCONNECTED,
    message: ""
  },
  joinCode: "",
  turn: -1,
  specialTurn: -1,
  phase: "regular",
  winner: -1,
  host: -1,
  announcement: "",
  players: []
};

export default function roomReducer(state = initialState, action) {
  switch (action.type) {
    case SET_STATUS:
      return Object.assign({}, state, {
        connection: {
          status: action.status,
          message: action.message
        }
      });
    case UPDATE_ROOM:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
}