
const {toolReducer} = require('./toolReducer');
const {modalReducer} = require('./modalReducer');
const {mouseReducer} = require('bens_ui_components');
const {config} = require('../config');
const {deepCopy} = require('bens_utils').helpers;
const {initState} = require('../state');

const rootReducer = (state, action) => {
  if (state === undefined) return initState();

  switch (action.type) {
    case 'STROKE':
    case 'FILL':
    case 'ERASE':
    case 'SELECT':
      state.actions = [...state.actions, action];
      state.redoActions = [];
      return toolReducer(state, action);
    case 'UNDO':
      if (state.actions.length == 0) return state;
      const undoneAction = state.actions.pop();
      state.redoActions = [undoneAction, ...state.redoActions];
      return {
        ...state,
        actions: [...state.actions],
      };
    case 'REDO':
      if (state.redoActions.length == 0) return state;
      const redoAction = state.redoActions.shift();
      state.actions = [...actions, redoAction];
      let nextState = {...state};
      // clear bitmap
      state.imageData = state.ctx.createImageData(state.width, state.height);
      for (const a of state.actions) {
        nextState = toolReducer(nextState, a);
      }
      return nextState;
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
