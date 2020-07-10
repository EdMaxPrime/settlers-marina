import axios from "axios";
import * as Status from "./index";

/********************************* ACTIONS ***********************************/

const SET_STATUS = "SET_MAP_STATUS";
const SET_MAP = "SET_MAP";

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

function setMap(data) {
  if(data.tiles)
    data.tiles = data.tiles.split("");
  return {
    type: SET_MAP,
    payload: data
  }
}

/********************************* THUNKS ***********************************/

export function loadMap() {
  return function(dispatch, getStore) {
    dispatch(setStatus(Status.CONNECTING, "Loading map..."));
    axios.get(`/api/games/${getStore().room.id}/map`)
    .then(response => {
      dispatch(setMap(response.data));
      dispatch(setStatus(Status.CONNECTED, "Ok"));
    })
    .catch(error => {
      let reason = error.response? error.response.data : "Host chose invalid map";
      dispatch(setStatus(Status.ERROR, reason));
    });
  }
}

/********************************* REDUCER ***********************************/
const initialState = {
  connection: {
    status: Status.CONNECTING,
    message: ""
  }
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case SET_STATUS:
      return Object.assign({}, state, {
        connection: {
          status: action.status,
          message: action.message
        }
      });
    case SET_MAP:
      return Object.assign({}, state, action.payload);
    default:
      return state;
  }
}