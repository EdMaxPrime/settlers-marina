/********************************* ACTIONS ***********************************/

const SET_ACTION = "SET_ACTION";

export function setAction(a) {
  return {
    type: SET_ACTION,
    action: a
  };
}

/********************************* THUNKS ***********************************/

/********************************* REDUCER ***********************************/
const initialState = "settlement";

export default function actionReducer(state = initialState, action) {
  switch (action.type) {
    case SET_ACTION:
      return action.action;
    default:
      return state;
  }
}