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
const {config} = require('../config');
const {useEffect, useState, useMemo} = React;


const div = (pos, size) => {
  return {x: pos.x / size.width, y: pos.y / size.height};
}

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

  useMouseHandler(
    "canvas", {dispatch, getState},
    {
      leftDown: (state, dispatch, pos) => {
        if (state.tool == 'PIPETTE') {
          const px = state.ctx.getImageData(pos.x, pos.y, 1, 1).data;
          dispatch({color: 'rgb(' + px[0] +',' + px[1] + ',' + px[2] + ')'});
        } else {
          dispatch({type: 'START_ACTION'});
        }
      },
      mouseMove: (state, dispatch, pos) => {
        if (state?.tool == 'PEN' || state?.tool == 'ERASER') {
          if (!state?.mouse?.isLeftDown) return;
          dispatch({inMove: true});

          const {canvasDims} = state;
          if (state.prevInteractPos) {
            const prevPos = state.prevInteractPos;
            dispatch({type: toolToVerb[state.tool],
              start: div(prevPos, {width: paintAreaDims.width, height: paintAreaDims.height}),
              end: div(pos, {width: paintAreaDims.width, height: paintAreaDims.height}),
              color: state.color,
              thickness: state.thickness,
            });
            dispatch({prevInteractPos: pos});
          } else {
            dispatch({prevInteractPos: pos});
          }
        } else if (state.tool == 'PIPETTE') {
          const px = state.ctx.getImageData(pos.x, pos.y, 1, 1).data;
          dispatch({colorPreview: 'rgb(' + px[0] +',' + px[1] + ',' + px[2] + ')'});
        }
      },
      leftUp: (state, dispatch, gridPos) => {
        dispatch({type: 'END_ACTION'});
        dispatch({inMove: false});
        dispatch({prevInteractPos: null});
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
