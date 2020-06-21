import { combineReducers, applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import socket from "../websocket.js";

import * as reducers from "../reducers";

//this is the root reducer, which determines how "actions" affect the Redux store
const reducer = combineReducers(reducers);
//this is our middleware that changes how redux works
const middleware = composeWithDevTools(
	applyMiddleware(thunkMiddleware.withExtraArgument(socket))
);
//this is the global Redux store
const store = createStore(reducer, middleware);
//imported by index.js and passed to Provider element
export default store;