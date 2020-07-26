import axios from "axios";
import * as Status from "./index";
import {setAction} from "./action";
import {announcement} from "./room";

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

/**
 * @param www  an object with these fields:
 *   who: Player*
 *   what: Stlm | City | Road | Ship
 *   where: 
 */
function addStructure(www) {
  return {type: www.what, who: www.who, where: www.where};
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

export function buildSettlement(intersection) {
  return function(dispatch, getStore, client) {
    let data = {what: 'Stlm', where: intersection, who: getStore().user.playerID};
    client.emit("build", data, function(success) {
      if(success) {
        dispatch(announcement("Settlement at " + data.where));
        dispatch(addStructure(data));
      } else {
        dispatch(announcement("You can't build a settlement there"));
      }
      dispatch(setAction(null));
    });
  };
}

/**
 * Subscribe to map updates. Should be called AFTER map has been loaded.
 */
export function subscribeToMap() {
  return function(dispatch, getStore, client) {
    client.on("build", function(data) {
      dispatch(addStructure(data));
    });
  }
}

/**
 * Unsubscribe to map updates
 */
export function unsubscribeFromMap() {
  return function(dispatch, getStore, client) {
    client.off("build");
  }
}

/**************************** COORDINATE SYSTEM ******************************/

function World(m) {
  var Hex = function(row, col) {
    let obj = {};
    if(col === undefined) {
      obj.repr = row;
      obj.row = Math.floor(obj.repr / m.width);
      obj.col = (obj.row & 1) + 2 * (obj.repr % m.width);
    } else {
      obj.repr = m.width * row + Math.floor(col / 2);
      obj.row = row;
      obj.col = col;
    }
    obj.tile = m.tiles[obj.repr];
    obj.land = (obj.tile !== "O") && (obj.tile !== "~");
    obj.shore = false;
    obj.ocean = obj.tile === "O";
    obj.intersections = function(dir) {
      var i = [Intersection(obj.repr, -1), Intersection(obj.repr, 1)];
      if(dir) return dir === 1? i[1] : i[0];
      return i;
    };
    return obj;
  };
  var Intersection = function(tile, dir) {
    let obj = {};
    if(dir === undefined) {
      obj.repr = tile;
      obj.tile = Math.floor(obj.repr / 2);
      obj.dir = (obj.repr % 2 === 0)? -1 : 1;
    } else {
      obj.repr = tile * 2 + ((dir === 1)? 1 : 0);
      obj.tile = tile;
      obj.dir = dir;
    }
    /* [hexOdd, hexLeft, hexRight] */
    obj.hexagons = function() {
      var h = [Hex(obj.tile)];
      h[1] = Hex(h[0].row+obj.dir, h[0].col-1);
      h[2] = Hex(h[0].row+obj.dir, h[0].col+1);
      return h;
    };
    obj.intersections = function() {
      var h = obj.hexagons();
      var d = (obj.dir === 1)? -1 : 1; //opposite direction
      var i = [Intersection(Hex(h[0].row + 2*obj.dir, h[0].col).repr, d)];
      i[1] = Intersection(h[1].repr, d);
      i[2] = Intersection(h[2].repr, d);
      return i;
    };
    obj.edges = function() {
      var h = obj.hexagons();
      return [Edge(h[0].repr, h[1].repr), Edge(h[1].repr, h[2].repr), Edge(h[2].repr, h[0].repr)];
    };
    obj.land = false;
    obj.ocean = false;
    obj.hexagons().forEach(h => {
      if(h.land) obj.land = true;
      if(h.ocean) obj.ocean = true;
    });
    obj.shore = obj.land && obj.ocean;
    return obj;
  };
  var Edge = function(h1, h2) {
    var obj = {};
    if(h1 > h2) {
      let temp = h1;
      h1 = h2;
      h2 = temp;
    }
    obj.repr = [h1, h2];
    /* Hexagons sorted by index */
    obj.hexagons = function() {
      return [Hex(h1), Hex(h2)];
    };
    let h = obj.hexagons();
    if(h[0].row === h[1].row)
      obj.dir = "|";
    else if(h[0].col > h[1].col)
      obj.dir = "\\";
    else
      obj.dir = "/";
    obj.land = h[0].land && h[1].land;
    obj.ocean = h[0].ocean && h[1].ocean;
    obj.shore = obj.land && obj.ocean;
    obj.intersections = function() {
      let h = obj.hexagons();
      if(obj.dir === "|")
        return [Intersection(Hex(h[0].row-1, h[1].col+1).repr, 1),
                Intersection(Hex(h[0].row+1, h[1].col+1).repr, -1)];
      else
        return [Intersection(h[0].repr, -1), Intersection(h[1].repr, 1)];
    };
    return obj;
  };
  var mobj = {Hex: Hex, Intersection: Intersection, Edge: Edge};
  mobj.hexagons = function(callback) {
    for(let i = 0; i < m.width * m.height; i++) {
      let h = mobj.Hex(i);
      callback(h);
    }
  };
  mobj.intersections = function(callback) {
    mobj.hexagons(function(h) {
      if(h.row > 0 && h.col > 0 && h.col < m.width*2-1) 
        callback(h.intersections(-1));
      if(h.row < m.height-1 && h.col > 0 && h.col < m.width*2-1) 
        callback(h.intersections(+1));
    });
  };
  mobj.edges = function(callback) {
    mobj.hexagons(function(h) {
      //edge | if there's a hex to the right
      if(h.repr % m.width !== m.width-1)
        callback(Edge(h.repr, h.repr+1));
      //edge / if there's a hex to the lower right
      if(h.row < m.height-1 && h.col < m.width*2-1)
        callback(Edge(h.repr, Hex(h.row+1, h.col+1).repr));
      //edge \ if there's a hex to the lower left
      if(h.row < m.height-1 && h.col > 0)
        callback(Edge(h.repr, Hex(h.row+1, h.col-1).repr));
    });
  };
  return mobj;
}
/*
World({width, height, tiles[]})
.hexagons(callback(Hex))
.intersections(callback(Intersection))
.edges(callback(Edge))
.Hex(i) or Hex(row, col)
  - intersections(): Intersection[]
  - intersections(dir): Intersection
  - row: int
  - col: int
  - repr: int
  - tile: char
  - land: bool
  - ocean: bool
.Intersection(i) or Intersection(tile, dir)
  - hexagons(): Hex[]
  - intersections(): Intersection[]
  - edges(): Edge[]
  - repr: int
  - dir: -1 or 1
  - land: bool
  - shore: bool
  - ocean: bool
.Edge(h1, h2)
  - hexagons(): Hex[]
  - intersections(): Intersection[]
  - repr: int[2]
  - dir: / or | or \
  - land: bool
  - shore: bool
  - ocean: bool
*/

/********************************* REDUCER ***********************************/

function connectionReducer(state = {}, action) {
  if(action.type === SET_STATUS || action.status === Status.DISCONNECTED) {
    return {
      status: action.status,
      message: action.message
    };
  }
  return state;
}

function buildingsReducer(state = {}, action) {
  if(action.type === "Stlm" || action.type === "City") {
    return {
      ...state,
      [action.where]: [action.who, action.type]
    };
  }
  else if(action.type === "RESET") return {};
  return state;
}
/** Updates map.roads:
 * @param state   map.roads
 * @param action  {type: Road|Ship, where: Tile*[2], who: Player*}
 * @return  map.roads with an extra property:
 *   key: action.where[0] + "," + action.where[1] 
 *   value: [Player* owner, City|Ship type]
 */
function roadsReducer(state = {}, action) {
  if(action.type === "Road" || action.type === "Ship") {
    let loc = action.where.join(",");
    return {
      ...state,
      [loc]: [action.who, action.type]
    };
  }
  else if(action.type === "RESET") return {};
  return state;
}

function possibleReducer(map, action) {
  var prev = map.possible || {
    settlement: []
  };
  var changes = {};
  //when the map is fetched, loop through each tile and try to add intersections if they touch land
  if(action.type === SET_MAP) {
    changes.settlement = [];
    World(action.payload).intersections(i => {
      if(i.land || i.shore) {
        changes.settlement.push(i.repr);
      }
    });
  }
  //if Stlm, remove intersections that are adjacent
  if(action.type === "Stlm") {
    //find adjacent intersections
    let illegal = World(map).Intersection(action.where).intersections().map(i => i.repr);
    illegal.push(action.where); //add the building itself since its occupied
    console.log("Filter illegal intersections: ", illegal);
    changes.settlement = prev.settlement.filter((intersection) => {
      return illegal.indexOf(intersection) === -1;
    });
  }
  //if Road, remove in
  else if(action.type === "RESET") {
    changes.settlement = [];
  }
  //return changes
  return Object.assign({}, prev, changes);
}

export default function mapReducer(state = {}, action) {
  let next = {
    ...state,
    connection: connectionReducer(state.connection, action),
    buildings: buildingsReducer(state.buildings, action),
    roads: roadsReducer(state.roads, action),
    possible: possibleReducer(state, action)
  };
  if(action.type === SET_MAP) {
    Object.assign(next, action.payload);
  }
  return next;
}