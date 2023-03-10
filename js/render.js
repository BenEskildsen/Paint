const {config} = require('./config');
const {
  getColorAtPixel, colorToHex, colorToRGBA, stringToColor,
} = require('./selectors/colors');
const {getTrueCanvasDims} = require('./selectors/canvas');
const {getNeighbors} = require('./selectors/pixels');

async function render(state) {
  const {ctx, canvasDims, windowDims} = state;
  if (!ctx) return;

  const {width, height} = getTrueCanvasDims(state);

  doContextScaling(state, ctx);
  ctx.putImageData(ctx.createImageData(canvasDims.width, canvasDims.height), 0, 0);
  ctx.restore();

  for (const transaction of state.transactions) {
    for (const action of transaction) {
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

  doContextScaling(state, ctx);

  switch (action.type) {
    case 'STROKE': {
      ctx.beginPath();
      const line = action;
      const start = line.start;
      const end = line.end;
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
      const start = line.start;
      const end = line.end;
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
      break;
    }
    case 'FILL': {
      let {position, fuzzFactor, imageData} = action;
      if (!imageData) {
        const color = stringToColor(action.color);
        const colorToFill = getColorAtPixel(ctx, position);
        imageData = ctx.getImageData(0, 0, canvasDims.width, canvasDims.height);
        const alreadyVisited = {};
        const pixels = [position];
        while (pixels.length > 0) {
          const pixel = pixels.pop();
          alreadyVisited[posToStr(pixel)] = true;
          setPixelColor(imageData, canvasDims, pixel, color);
          const neighbors = getNeighbors(pixel, canvasDims).filter(pos => {
            if (alreadyVisited[posToStr(pos)]) return false;
            const colorAtPixel = getColorAtPixel(ctx, pos);
            for (let c of ['r','g','b']) {
              if (Math.abs(colorAtPixel[c] - colorToFill[c]) > fuzzFactor) {
                return false;
              }
            }
            return Math.abs(colorAtPixel.a * 255 - colorToFill.a * 255) <= fuzzFactor * 2;
          });
          // console.log(neighbors);
          pixels.push(...neighbors);
        }
        action.imageData = imageData;
      }
      ctx.putImageData(imageData, 0, 0);
      ctx.restore(); // NOTE: this has to be here for promise to work
      if (resolve) resolve();
      break;
    }
    case 'DRAW_SQUARE': {
      drawSquare(ctx, action);
      ctx.restore(); // NOTE: this has to be here for promise to work
      if (resolve) resolve();
      break;
    }
    case 'COMMIT_SELECTION': {
      ctx.putImageData(action.imageData, action.x, action.y);
      ctx.restore();
      if (resolve) resolve();
      break;
    }
    case 'CUT': {
      ctx.putImageData(ctx.createImageData(action.width, action.height), action.x, action.y);
      ctx.restore();
      if (resolve) resolve();
      break;
    }
  }
}


// must be paired with a ctx.restore() afterwards!
const doContextScaling = (state, ctx) => {
  const {canvasDims, windowDims} = state;
  ctx.save();
  const {width, height} = getTrueCanvasDims(state);
  const pxW = width / canvasDims.width;
  const pxH = height / canvasDims.height;
  ctx.imageSmoothingEnabled = false;
  ctx.scale(pxW, pxH);
  ctx.translate(0.5, 0.5);
}

const posToStr = (pos) =>{
  return `${pos.x}_${pos.y}`;
}

const setPixelColor = (imageData, canvasDims, pos, color) => {
  const index = 4 * pos.y * canvas.width + 4 * pos.x;
  imageData.data[index] = color.r;
  imageData.data[index + 1] = color.g;
  imageData.data[index + 2] = color.b;
  if (color.a !== undefined) {
    imageData.data[index + 3] = color.a * 255;
  } else {
    imageData.data[index + 3] = 255;
  }
}

const drawSquare = (ctx, action) => {
  const {square, squareType, thickness, color, isDashed} = action;
  ctx.lineWidth = thickness || ctx.lineWidth;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  if (isDashed) {
    ctx.setLineDash([5, 5]);
  }
  if (squareType == 'Filled') {
    ctx.fillRect(square.x, square.y, square.width, square.height);
  } else if (squareType == 'Empty') {
    ctx.beginPath();
    ctx.rect(square.x, square.y, square.width, square.height);
    ctx.closePath();
    ctx.stroke();
  }
};


module.exports = {
  render, renderAction, setPixelColor,
  drawSquare, doContextScaling,
};
