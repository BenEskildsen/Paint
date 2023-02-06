const React = require('react');
const {
  Button, Modal,
  Canvas, RadioPicker,
  CheckerBackground, DragArea,
} = require('bens_ui_components');
const {
  useEnhancedReducer, useResponsiveDimensions,
  useMouseHandler, mouseReducer,
} = require('bens_ui_components');
const {
  getColorAtPixel, colorToHex, colorToRGBA, stringToColor,
} = require('../selectors/colors');
const {drawSquare, doContextScaling} = require('../render');
const {getNeighbors, insideCanvas} = require('../selectors/pixels');
const {getTrueCanvasDims} = require('../selectors/canvas');
const {config} = require('../config');
const {useEffect, useState, useMemo} = React;


const toolToVerb = {
  'PEN': 'STROKE',
  'ERASER': 'ERASE',
}

const PaintArea = (props) => {
  const {state, dispatch, getState} = props;
  const {canvasDims, windowDims} = state;
  const paintAreaDims = {
    width: windowDims.width - config.toolBarWidth,
    height: windowDims.height - config.colorBarHeight,
  };
  const {width, height} = getTrueCanvasDims(state);

  // Mouse handling
  useMouseHandler(
    "canvas", {dispatch, getState},
    {
      leftDown: (state, dispatch, pos) => {
        switch (state.tool) {
          case 'PIPETTE':
            dispatch({color: colorToRGBA(getColorAtPixel(state.ctx, pos))});
            break;
          case 'SQUARE':
            dispatch({square: {...pos}});
            break;
          case 'SELECT':
            if (state.selection == null) {
              dispatch({square: {...pos}});
            }
            break;
          default:
            dispatch({type: 'START_TRANSACTION'});
            break;
        }
      },
      mouseMove: (state, dispatch, pos) => {
        switch (state.tool) {
          case 'ERASER':
          case 'PEN': {
            if (!state?.mouse?.isLeftDown) return;
            const {width, height} = getTrueCanvasDims(state);
            const {canvasDims} = state;
            if (state.prevInteractPos) {
              const prevPos = state.prevInteractPos;
              dispatch({type: toolToVerb[state.tool],
                start: {
                  x: prevPos.x * canvasDims.width / width,
                  y: prevPos.y * canvasDims.height / height,
                },
                end: {x: pos.x * canvasDims.width / width, y: pos.y * canvasDims.height / height},
                color: state.color,
                thickness: state.thickness,
              });
            }
            dispatch({prevInteractPos: pos});
            break;
          }
          case 'PIPETTE':
          case 'BUCKET':
            dispatch({colorPreview: colorToRGBA(getColorAtPixel(state.ctx, pos))});
            break;
          case 'SQUARE':
            if (!state?.mouse?.isLeftDown) return;
            dispatch({square: {...state.square,
              width: pos.x - state.square.x,
              height: pos.y - state.square.y,
            }});
            break;
          case 'SELECT':
            if (!state?.mouse?.isLeftDown) return;
            if (state.selection != null) return;
            dispatch({square: {...state.square,
              width: pos.x - state.square.x,
              height: pos.y - state.square.y,
            }});
            break;
        }
      },
      leftUp: (state, dispatch, pos) => {
        switch (state.tool) {
          case 'BUCKET':
            dispatch({type: 'START_TRANSACTION'});
            dispatch({type: 'FILL',
              position: {x: Math.round(pos.x), y: Math.round(pos.y)},
              color: state.color,
              fuzzFactor: state.fuzzFactor,
            });
            dispatch({type: 'END_TRANSACTION'});
            break;
          case 'SQUARE':
            dispatch({type: 'START_TRANSACTION'});
            dispatch({type: 'DRAW_SQUARE',
              thickness: state.thickness, squareType: state.squareType, color: state.color,
              square: {...state.square},
            });
            dispatch({square: null});
            dispatch({type: 'END_TRANSACTION'});
            break;
          case 'SELECT':
            dispatch({type: 'START_TRANSACTION'});
            dispatch({type: 'CUT', ...state.square});
            dispatch({selection: {
              ...state.square,
              imageData: state.ctx.getImageData(
                state.square.x, state.square.y, state.square.width, state.square.height,
              ),
            }});
            dispatch({square: null});
            break;
          default: {
            dispatch({type: 'END_TRANSACTION'});
            dispatch({prevInteractPos: null});
            break;
          }
        }
      }
    },
  );

  // paste:
  useEffect(() => {
    document.addEventListener('paste', (ev) => {
      if (!ev.clipboardData) return;
      const items = ev.clipboardData.items;
      if (!items) return;
      let source = null;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const blob = items[i].getAsFile();
          const URLObj = window.URL || window.webkitURL;
          source = URLObj.createObjectURL(blob);

        }
      }
      if (source) {
        dispatch({type: 'START_TRANSACTION'});
        dispatch({type: 'PASTE', source});
        dispatch({type: 'END_TRANSACTION'});
      }
      ev.preventDefault();
    }, false);
  }, []);

  // preview
  let previewCanvas = null;
  if (state.square != null) {
    previewCanvas = (
      <Canvas
        id="previewCanvas"
        style={{
          zIndex: 3,
          position: 'absolute',
          top: 0, left: 0,
          pointerEvents: 'none',
        }}
        width={width}
        height={height}
      />
    );
  }
  useEffect(() => {
    if (state.square == null) return;
    const canvas = document.getElementById("previewCanvas");
    if (canvas == null) return;
    const ctx = canvas.getContext("2d");
    doContextScaling(state, ctx);
    ctx.putImageData(ctx.createImageData(canvasDims.width, canvasDims.height), 0, 0);
    const color = state.tool == 'SQUARE' ? state.color : 'black';
    const thickness = state.tool == 'SQUARE' ? state.thickness : 1;
    drawSquare(ctx, {
      square: state.square, thickness, color,
      squareType: 'Empty', isDashed: state.tool == 'SELECT',
    });
    ctx.restore();
  }, [state.square]);

  // selection
  let selectionArea = null;
  if (state.selection != null) {
    selectionArea = (
      <DragArea
        style={{
          width, height,
          zIndex: 3,
          top: 0, left: 0,
          position: 'absolute',
        }}
        onDrop={(id, position) => {
          dispatch({selection: {...state.selection, ...position}});
        }}
      >
        {[(<div // HACK: needs to be part of an array for props.children.map in DragArea
          id="selection"
          key="selection"
          style={{
            position: 'absolute',
            top: state.selection.y, left: state.selection.x,
            width: state.selection.width, height: state.selection.height,
            border: '2px dashed black',
          }}
        >
          <Canvas
            id="selectionCanvas"
            width={state.selection.width} height={state.selection.height}
          />
        </div>)]}
      </DragArea>
    );
  }
  useEffect(() => {
    if (state.selection == null) return;
    const canvas = document.getElementById("selectionCanvas");
    if (canvas == null) return;
    const ctx = canvas.getContext("2d");
    ctx.putImageData(state.selection.imageData, 0, 0);
  }, [state.selection]);

  return (
    <div
      style={{
        width: paintAreaDims.width,
        height: '100%',
        backgroundColor: 'lightgray',
        position: 'relative',
      }}
    >
      <CheckerBackground
        style={{
          position: 'absolute',
          zIndex: 1,
          opacity: 0.5,
        }}
        pixelSize={{width, height}}
        gridSize={{width: width / 10, height: height / 10}}
        color1={"white"}
        color2={"grey"}
      />
      <Canvas
        style={{
          zIndex: 2,
          position: 'absolute',
          top: 0, left: 0,
        }}
        width={width}
        height={height}
      />
      {previewCanvas}
      {selectionArea}
    </div>
  );
};


module.exports = PaintArea;
