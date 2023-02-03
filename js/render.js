const {config} = require('./config');

async function render(state) {
  const {ctx, canvasDims, windowDims} = state;
  if (!ctx) return;

  const paintAreaWidth  = windowDims.width - config.toolBarWidth;
  const paintAreaHeight = windowDims.height - config.colorBarHeight;

  ctx.save();
  const pxW = paintAreaWidth / canvasDims.width;
  const pxH = paintAreaHeight / canvasDims.height;
  ctx.scale(pxW, pxH);

  ctx.putImageData(ctx.createImageData(canvasDims.width, canvasDims.height), 0, 0);
  ctx.restore();

  ctx.lineWidth = 2;

  for (const actionList of state.actions) {
    for (const action of actionList) {
      await renderActionPromise(state, action);
    }
  }

}

const renderActionPromise = (state, action) => {
  return new Promise((resolve, reject) => {
    renderAction(state, action, resolve);
  });
}

const renderAction = (state, action, resolve) => {
  const {ctx, canvasDims, windowDims} = state;
  if (!ctx) return;


  ctx.save();
  const paintAreaWidth  = windowDims.width - config.toolBarWidth;
  const paintAreaHeight = windowDims.height - config.colorBarHeight;
  const pxW = paintAreaWidth / canvasDims.width;
  const pxH = paintAreaHeight / canvasDims.height;
  ctx.scale(pxW, pxH);

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
      ctx.restore(); // NOTE: this has to be here for promise to work
      if (resolve) resolve();
      break;
    }
    case 'ERASE': {
      ctx.beginPath();
      ctx.globalCompositeOperation = "destination-out";
      const line = action;
      const start = mult(line.start, canvasDims);
      const end = mult(line.end, canvasDims);
      ctx.lineWidth = line.thickness || ctx.lineWidth;
      ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.closePath();
      ctx.restore(); // NOTE: this has to be here for promise to work
      if (resolve) resolve();
      break;
    }
    case 'PASTE': {
      const pastedImage = new Image();
      pastedImage.onload = function() {
        ctx.drawImage(pastedImage, 0, 0);
        if (resolve) resolve();
      }
      pastedImage.src = action.source;
      ctx.restore(); // NOTE: this has to be here for promise to work
    }
  }
}

const mult = (pos, size) => {
  return {x: pos.x * size.width, y: pos.y * size.height};
}

module.exports = {render, renderAction};
