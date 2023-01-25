const {config} = require('./config');

const initState = () => {
  return {
    actions: [],
    redoActions: [],

    // canvas state
    canvasDims: {width: config.initialWidth, height: config.initialHeight},
    windowDims: {width: window.innerWidth, height: window.innerHeight},
    ctx: null, // will get initialized in Main.react
    imageData: null,

    // tool state
    tool: 'PEN',
    color: 'black',
    thickness: 6,
    secondaryColor: 'white',
    mouse: undefined, // will get defined by mouseReducer
  };
};

module.exports = {
  initState,
}
