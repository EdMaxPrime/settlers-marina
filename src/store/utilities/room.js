import Status from "./index";

/********************************* ACTIONS ***********************************/

const SET_STATUS = "SET_STATUS";
const SET_JOINCODE = "SET_JOINCODE";

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

function updateRoom(joinCode) {
  return {
    type: SET_JOINCODE,
    payload: joinCode
  };
}

/********************************* THUNKS ***********************************/

export function connectRoom() {
  return function(dispatch) {
    //dispatch(setStatus(LOADING, "Logging in..."))
    //axios.post().then(res => {dispatch(setStatus(CONNECTED, ""))})
  };
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
    case SET_JOINCODE:
      return Object.assign({}, state, {
        joinCode: action.payload
      });
    default:
      return state;
  }
}