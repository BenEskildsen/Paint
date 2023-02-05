
const {toolReducer} = require('./toolReducer');
const {modalReducer} = require('./modalReducer');
const {mouseReducer} = require('bens_ui_components');
const {config} = require('../config');
const {deepCopy} = require('bens_utils').helpers;
const {render} = require('../render');
const {initState} = require('../state');

const rootReducer = (state, action) => {
  if (state === undefined) return initState();

  switch (action.type) {
    case 'END_ACTION':
      state.redoActions = [];
      // fall-through
    case 'START_ACTION':
      if (state.curAction.length > 0) {
        state.actions.push(state.curAction);
      }
      state.curAction = [];
      return {...state};
    case 'STROKE':
    case 'FILL':
    case 'ERASE':
    case 'DRAW_SQUARE':
    case 'COMMIT_SELECTION':
    case 'PASTE':
      state.curAction.push(action);
      return toolReducer(state, action);
    case 'UNDO': {
      if (state.actions.length == 0) return state;
      const undoneAction = state.actions.pop();
      const nextState = {
        ...state,
        redoActions: [undoneAction, ...state.redoActions],
        actions: [...state.actions],
      };
      render(nextState);
      return nextState;
    }
    case 'REDO': {
      if (state.redoActions.length == 0) return state;
      const redoAction = state.redoActions.shift();
      state.actions = [...state.actions, redoAction];
      let nextState = {...state};
      for (const a of state.actions) {
        nextState = toolReducer(nextState, a);
      }
      render(nextState);
      return nextState;
    }
    case 'SET_CANVAS_DIMS': {
      const {width, height} = action;
      return {
        ...state,
        canvasDims: {width, height},
      }
    }
    case 'SET_MOUSE_DOWN':
    case 'SET_MOUSE_POS':
      return {
        ...state,
        mouse: mouseReducer(state.mouse, action),
      };
    case 'SET_MODAL':
    case 'DISMISS_MODAL':
      return modalReducer(state, action);
  }
  return state;
};

module.exports = {rootReducer};
