import { combineReducers, applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";

import * as reducers from "../reducers";

//this is the root reducer, which determines how "actions" affect the Redux store
const reducer = combineReducers(reducers);
//this is the global Redux store
const store = createStore(reducer, applyMiddleware(thunkMiddleware));
//imported by index.js and passed to Provider element
export default store;