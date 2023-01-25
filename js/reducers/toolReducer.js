
const {render} = require('../render');

const toolReducer = (state, action) => {
  switch (action.type) {
    case 'STROKE':
    case 'FILL':
    case 'ERASE':
    case 'SELECT':
      render(state);
      return {...state};
  }
  return state;
};

module.exports = {toolReducer};
