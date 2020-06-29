import * as Status from "./index";
import axios from "axios";

/********************************* ACTIONS ***********************************/

const SET_STATUS = "SET_STATUS";
const UPDATE_ROOM = "UPDATE_ROOM";
const ADD_PLAYER = "ADD_PLAYER";
const REMOVE_PLAYER = "REMOVE_PLAYER";

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

/** Server-sent action dispatcher for "announcement" events */
function announcement(message) {
  announcement.dispatch(updateRoom({announcement: message}));
}

/** Server-sent action dispatcher for "announcement" events */
function settingsChanged(settings) {
  settingsChanged.dispatch({type: "settings"});
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
      //correctly map players array to player numbers
      response.data.players = [null].concat(response.data.Players);
      dispatch(updateRoom(response.data));
    })
    .catch(function(error) {
      dispatch(setRoomStatus(Status.ERROR, "Failed to join game"));
    });
  };
}

/**
 * Call this to listen to announcements from the server. Don't call twice.
 */
export function subscribeToAnnouncements() {
  return function(dispatch, getStore, client) {
    announcement.dispatch = dispatch;
    client.on("announcement", announcement);
    client.on("player_join", function(player) {
      dispatch({type: ADD_PLAYER, payload: player});
    });
    client.on("player_leave", function(player_id) {
      dispatch({type: REMOVE_PLAYER, payload: player_id});
    });
  }
}

/**
 * Call this to stop listening to announcements from the server.
 */
export function unsubscribeFromAnnouncements() {
  return function(dispatch, getStore, client) {
    client.off("announcement", announcement);
    client.off("player_join");
  }
}

export function subscribeToSettings() {
  return function(dispatch, getStore, client) {
    client.on("settings", settingsChanged);
  }
}

export function unsubscribeFromSettings() {
  return function(dispatch, getStore, client) {
    client.off("settings", settingsChanged);
  }
}

export function nextTurn() {
  return function(dispatch, getStore, client) {
    dispatch({type: "next turn"});
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
  players: [null],
  order: []
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
      let a = Object.assign({}, state, action.payload);
      a.order = a.players.filter(player => player != null && player.status === "JOINED")
      .sort((p1, p2) => p1.turn_order - p2.turn_order)
      .map(player => player.player_id);
      return a;
    case ADD_PLAYER:
      let p = state.players.slice();
      p[action.payload.player_id] = action.payload;
      return Object.assign({}, state, {
        num_players: state.num_players + 1,
        players: p,
        order: state.order.concat(action.payload.player_id)
      });
    case REMOVE_PLAYER:
      return Object.assign({}, state, {
        num_players: state.num_players - 1,
        players: state.players.map(function(player) {
          return (player !== null && player.player_id === action.payload)? null : player;
        }),
        order: state.order.filter(function(t) {
          return t !== action.payload;
        })
      });
    default:
      return state;
  }
}