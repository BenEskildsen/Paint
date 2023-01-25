const {config} = require('./config');

const render = (state) => {
  const {ctx, canvasDims, windowDims} = state;
  if (!ctx) return;
  const paintAreaWidth  = windowDims.width - config.toolBarWidth;
  const paintAreaHeight = windowDims.height - config.colorBarHeight;

  ctx.save();
  ctx.fillStyle = 'white';
  const pxW = paintAreaWidth / canvasDims.width;
  const pxH = paintAreaHeight / canvasDims.height;
  ctx.scale(pxW, pxH);

  ctx.fillRect(0, 0, canvasDims.width, canvasDims.height);

  ctx.lineWidth = 4;

  for (const action of state.actions) {
    switch (action.type) {
      case 'STROKE': {
        ctx.beginPath();
        const line = action;
        const start = mult(line.start, canvasDims);
        const end = mult(line.end, canvasDims);
        ctx.lineWidth = line.thickness || ctx.lineWidth;
        ctx.strokeStyle = line.color;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.closePath();
      }
    }
  }

  ctx.restore();
}
const mult = (pos, size) => {
  return {x: pos.x * size.width, y: pos.y * size.height};
}

module.exports = {render};
