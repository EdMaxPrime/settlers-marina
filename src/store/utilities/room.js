import * as Status from "./index";
import axios from "axios";
import {setStatus} from "./user";
import {loadMap} from "./map";

/********************************* ACTIONS ***********************************/

const SET_STATUS = "SET_STATUS";
const UPDATE_ROOM = "UPDATE_ROOM";
const ADD_PLAYER = "ADD_PLAYER";
const UPDATE_PLAYER = "UPDATE_PLAYER";
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
export function announcement(message) {
  return updateRoom({announcement: message});
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
      dispatch(loadMap(response.data.MapId));
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
    client.on("announcement", function(a) {
      dispatch(announcement(a));
    });
    client.on("player_join", function(player) {
      dispatch({type: ADD_PLAYER, payload: player});
    });
    client.on("player_leave", function(player_id) {
      dispatch({type: REMOVE_PLAYER, payload: player_id});
    });
    client.on("disconnect", function() {
      dispatch(setStatus(Status.DISCONNECTED, "You were disconnected from " + getStore().room.id));
    });
    client.on("next_turn", function(phase, turn) {
      console.log("received next_turn event: phase=" + phase + ", turn=" + turn);
      dispatch(updateRoom({phase: phase, turn_now: turn}));
    });
    client.on("player_change", function(data) {
      dispatch({type: UPDATE_PLAYER, who: data.player_id, payload: data});
    });
  }
}

/**
 * Call this to stop listening to announcements from the server.
 */
export function unsubscribeFromAnnouncements() {
  return function(dispatch, getStore, client) {
    client.off("announcement");
    client.off("player_join");
    client.off("disconnect");
    client.off("next_turn");
    client.off("player_change");
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
    console.log("emmitting next_turn");
    client.emit("next_turn");
  }
}

export function skipTurn() {
  return function(dispatch, getStore, client) {
    client.emit("skip_turn");
  }
}

/********************************* REDUCER ***********************************/
const initialState = {
  connection: {
    status: Status.DISCONNECTED,
    message: ""
  },
  joinCode: "",
  turn_now: -1,
  specialTurn: -1,
  phase: "regular",
  winner: -1,
  host: -1,
  announcement: "",
  players: [null]
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
    case ADD_PLAYER:
      let p = state.players.slice();
      p[action.payload.player_id] = action.payload;
      return Object.assign({}, state, {
        num_players: state.num_players + 1,
        players: p
      });
    case UPDATE_PLAYER:
      return Object.assign({}, state, {
        players: state.players.map(player => {
          if(player !== null && player.player_id === action.who) {
            return Object.assign({}, player, action.payload)
          } else {
            return player;
          }
        })
      });
    case REMOVE_PLAYER:
      let o = Infinity;
      if(state.players[action.payload] !== null) o=state.players[action.payload].turn_order;
      return Object.assign({}, state, {
        num_players: state.num_players - 1,
        players: state.players.map(function(player) {
          //if player was already deleted OR is the one being removed, replace with null
          if(player === null || player.player_id === action.payload) {
            return null;
          }
          //fill in the hole in the turn order left by the missing player
          else if(player.turn_order > o) {
            return Object.assign({}, player, {
              turn_order: player.turn_order - 1
            });
          }
          //otherwise, don't change this player
          return player;
        })
      });
    case "RESET":
      return initialState;
    default:
      return state;
  }
}