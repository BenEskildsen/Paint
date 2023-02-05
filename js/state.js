const {config} = require('./config');

const initState = () => {
  return {
    modal: null,

    actions: [],
    curAction: [], // NOTE: action here is an array of redux actions
    redoActions: [],

    // canvas state
    canvasDims: {width: config.initialWidth, height: config.initialHeight},
    windowDims: {width: window.innerWidth, height: window.innerHeight},
    ctx: null, // will get initialized in Main.react

    // tool state
    tool: 'PEN',
    color: 'black',
    thickness: 4,
    square: null, // square that's being currently drawn
    squareType: 'Filled',
    selection: null, // a square + imageData
    fuzzFactor: 0, // for bucket fill
    secondaryColor: 'white',

    mouse: undefined, // will get defined by mouseReducer
  };
};

module.exports = {
  initState,
}
