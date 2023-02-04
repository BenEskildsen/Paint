const {config} = require('../config');

const getTrueCanvasDims = (state) => {
  const {canvasDims, windowDims} = state;
  const paintAreaDims = {
    width: windowDims.width - config.toolBarWidth,
    height: windowDims.height - config.colorBarHeight,
  };
  let width = canvasDims.width;
  let height = canvasDims.height;
  if (paintAreaDims.height < height) {
    width = width * (paintAreaDims.height / height);
    height = paintAreaDims.height;
  }
  if (paintAreaDims.width < width) {
    height = height * (paintAreaDims.width / width);
    width = paintAreaDims.width;
  }
  return {width, height};
}

module.exports = {
  getTrueCanvasDims,
}
