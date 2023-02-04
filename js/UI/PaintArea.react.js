const React = require('react');
const {
  Button, Modal,
  Canvas, RadioPicker,
  CheckerBackground,
} = require('bens_ui_components');
const {
  useEnhancedReducer, useResponsiveDimensions,
  useMouseHandler, mouseReducer,
} = require('bens_ui_components');
const {
  getColorAtPixel, colorToHex, colorToRGBA, stringToColor,
} = require('../selectors/colors');
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

  useMouseHandler(
    "canvas", {dispatch, getState},
    {
      leftDown: (state, dispatch, pos) => {
        if (state.tool == 'PIPETTE') {
          dispatch({color: colorToRGBA(getColorAtPixel(state.ctx, pos))});
        } else if (state.tool == 'SQUARE') {
          dispatch({square: {...pos}});
        } else {
          dispatch({type: 'START_ACTION'});
        }
      },
      mouseMove: (state, dispatch, pos) => {
        if (state?.tool == 'PEN' || state?.tool == 'ERASER') {
          if (!state?.mouse?.isLeftDown) return;
          dispatch({inMove: true});

          const {width, height} = getTrueCanvasDims(state);
          const {canvasDims} = state;
          if (state.prevInteractPos) {
            const prevPos = state.prevInteractPos;
            dispatch({type: toolToVerb[state.tool],
              start: {x: prevPos.x * canvasDims.width / width, y: prevPos.y * canvasDims.height / height},
              end: {x: pos.x * canvasDims.width / width, y: pos.y * canvasDims.height / height},
              color: state.color,
              thickness: state.thickness,
            });
            dispatch({prevInteractPos: pos});
          } else {
            dispatch({prevInteractPos: pos});
          }
        } else if (state.tool == 'PIPETTE' || state.tool == 'BUCKET') {
          dispatch({colorPreview: colorToRGBA(getColorAtPixel(state.ctx, pos))});
        } else if (state.tool == 'SQUARE') {
          if (!state?.mouse?.isLeftDown) return;
          dispatch({square: {...state.square,
            width: pos.x - state.square.x,
            height: pos.y - state.square.y,
          }});
        }
      },
      leftUp: (state, dispatch, pos) => {
        if (state.tool == 'BUCKET') {
          dispatch({type: 'START_ACTION'});
          dispatch({type: 'FILL',
            position: {x: Math.round(pos.x), y: Math.round(pos.y)},
            color: state.color,
            fuzzFactor: state.fuzzFactor,
          });
          dispatch({type: 'END_ACTION'});
        } else if (state.tool == 'SQUARE') {
          dispatch({type: 'START_ACTION'});
          dispatch({type: 'DRAW_SQUARE',
            thickness: state.thickness, squareType: state.squareType, color: state.color,
            square: {...state.square},
          });
          dispatch({type: 'END_ACTION'});
        } else {
          dispatch({type: 'END_ACTION'});
          dispatch({inMove: false});
          dispatch({prevInteractPos: null});
        }
      },
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
        dispatch({type: 'START_ACTION'});
        dispatch({type: 'PASTE', source});
        dispatch({type: 'END_ACTION'});
      }
      ev.preventDefault();
    }, false);
  }, []);

  return (
    <div
      style={{
        width: paintAreaDims.width,
        height: '100%',
        backgroundColor: 'lightgray',
      }}
    >
      <CheckerBackground
        style={{
          position: 'absolute',
          top: 0,
          left: config.toolBarWidth,
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
          position: 'fixed',
        }}
        width={width}
        height={height}
      />

    </div>
  );
};


module.exports = PaintArea;
