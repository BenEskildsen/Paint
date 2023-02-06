
const {render, renderAction} = require('../render');

const toolReducer = (state, action) => {
  switch (action.type) {
    case 'COMMIT_SELECTION':
      state.selection = null;
      // fall-through
    case 'STROKE':
    case 'FILL':
    case 'ERASE':
    case 'DRAW_SQUARE':
    case 'CUT':
    case 'PASTE':
      renderAction(state, action);
      return {...state};
  }
  return state;
};

module.exports = {toolReducer};
