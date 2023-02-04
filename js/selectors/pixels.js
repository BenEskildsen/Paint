
const getNeighbors = (pos, canvasDims) => {
  let neighbors = [
    {x: pos.x - 1, y: pos.y},
    {x: pos.x + 1, y: pos.y},
    {x: pos.x, y: pos.y - 1},
    {x: pos.x, y: pos.y + 1},
  ];
  return neighbors.filter(p => insideCanvas(p, canvasDims));
}

const insideCanvas = (pos, canvasDims) => {
  return pos.x >= 0 && pos.y >= 0 && pos.x < canvasDims.width && pos.y < canvasDims.height;
}

module.exports = {
  getNeighbors,
  insideCanvas,
};
