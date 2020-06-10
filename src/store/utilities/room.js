import Status from "./index";
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
 * This action will refresh data about the room. You must provide the joinCode
 * to specify which room to get information about. This is because there is
 * no way to get the current redux state inside this function.
 * @param joinCode  the room's identifier
 * @param refresh   true if this is just a refresh of a room already joined,
 *                  false if connecting for the first time
 */
export function getRoomData(joinCode, refresh) {
  return function(dispatch) {
    if(!refresh)
      dispatch(setRoomStatus(Status.CONNECTING, "Loading Players..."));
    else
      dispatch(setRoomStatus(Status.REFRESHING, "Fetching Changes..."));
    axios.get("/api/game_info", {
      params: {id: joinCode}
    })
    .then(function(response) {
      dispatch(updateRoom(response))
    })
    .catch(function(error) {
      dispatch(setRoomStatus(Status.ERROR, "Failed to join game"));
    });
  };
}

/**
 * Ask the server to create a new room/game. The server will respond with the
 * room code (join code) of the new room. This user should then try to connect
 * to the room to become the host.
 * @param socket  a socketIO client that will connect to the room once it is
 *                created.
 */
export function createRoom(socket) {
  return function(dispatch) {
    dispatch(setRoomStatus(Status.CREATING, "Creating game..."));
    axios.post("/api/new_game")
    .then(function(response) {
      joinRoom(socket, response.join_code);
    })
    .catch(function(error) {
      dispatch(setRoomStatus(Status.ERROR, "Couldn't create game at this time. Please try later."));
    });
  }
}

/********************************* REDUCER ***********************************/
const initialState = {
  status: Status.DISCONNECTED,
  message: "",
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
        status: action.status,
        message: action.message
      });
    case UPDATE_ROOM:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
}