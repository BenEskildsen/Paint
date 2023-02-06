
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
    case 'END_TRANSACTION':
      state.redoTransactions = [];
      // fall-through
    case 'START_TRANSACTION':
      if (state.curTransaction.length > 0) {
        state.transactions.push(state.curTransaction);
      }
      state.curTransaction = [];
      return {...state};
    case 'STROKE':
    case 'FILL':
    case 'ERASE':
    case 'DRAW_SQUARE':
    case 'COMMIT_SELECTION':
    case 'CUT':
    case 'PASTE':
      state.curTransaction.push(action);
      return toolReducer(state, action);
    case 'UNDO': {
      if (state.transactions.length == 0) return state;
      let undoneAction = state.curTransaction; // if inside a txn, undo that
      if (undoneAction.length == 0) {
        undoneAction = state.transactions.pop();
      }
      const nextState = {
        ...state,
        selection: null,
        curTransaction: [],
        redoTransactions: [undoneAction, ...state.redoTransactions],
        transactions: [...state.transactions],
      };
      render(nextState);
      return nextState;
    }
    case 'REDO': {
      if (state.redoTransactions.length == 0) return state;
      const redoTransaction = state.redoTransactions.shift();
      state.transactions = [...state.transactions, redoTransaction];
      let nextState = {...state};
      for (const a of state.transactions) {
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
