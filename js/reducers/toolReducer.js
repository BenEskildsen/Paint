
const {render, renderAction} = require('../render');

const toolReducer = (state, action) => {
  switch (action.type) {
    case 'STROKE':
    case 'FILL':
    case 'ERASE':
    case 'DRAW_SQUARE':
    case 'SELECT':
    case 'PASTE':
      renderAction(state, action);
      return {...state};
  }
  return state;
};

module.exports = {toolReducer};
