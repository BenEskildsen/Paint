
const getColorAtPixel = (ctx, pos) => {
  const px = ctx.getImageData(pos.x, pos.y, 1, 1).data;
  return {r: px[0], g: px[1], b: px[2], a: parseFloat((px[3] / 255).toFixed(2))};
}

const colorToRGBA = (color) => {
  const {r, g, b, a} = color;
  return `rgba(${r},${g},${b},${a})`;
}

const colorToRGB = (color) => {
  const {r, g, b} = color;
  return `rgb(${r},${g},${b})`;
}

const colorToHex = (color) => {
  const {r, g, b} = color;
  return `#${cToHex(r)}${cToHex(g)}${cToHex(b)}`;
}

const cToHex = (c) => {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

const rgbaToColor = (rgba) => {
  const px = rgba.slice(5, -1).split(',').map((n, i) => {
    if (i < 3) {
      return parseInt(n);
    } else {
      return parseFloat(n);
    }
  });
  return {r: px[0], g: px[1], b: px[2], a: px[3]};
}

// color into the canvas then extract that color
const stringToColor = (colorStr) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = colorStr;
  ctx.fillRect(0, 0, 1, 1);
  return getColorAtPixel(ctx, {x: 0, y: 0});
}


module.exports = {
  getColorAtPixel,
  colorToRGBA,
  colorToRGB,
  colorToHex,
  rgbaToColor,
  stringToColor,
}
