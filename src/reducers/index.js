/*	barrel file for reducers so that we can pass them into combineReducers;
	all we are doing here is grabbing the default export of each utility file
	aka the reducer functions we will need to pass to combineReducers in
	store/index.js. Each utility file must default export their reducer
*/
export {default as user} from "../store/utilities/user.js"
export {default as room} from "../store/utilities/room.js"
export {default as chat} from "../store/utilities/chat.js"