const React = require('react');
const {
  Button, Modal,
  Canvas, RadioPicker,
} = require('bens_ui_components');
const {
  useEnhancedReducer, useResponsiveDimensions,
  useMouseHandler, mouseReducer,
} = require('bens_ui_components');
const {rootReducer} = require('../reducers/rootReducer');
const {initState} = require('../state');
const {config} = require('../config');
const {render} = require('../render');
const ColorBar = require('./ColorBar.react');
const ToolBar = require('./ToolBar.react');
const PaintArea = require('./PaintArea.react');
const {useEffect, useState, useMemo} = React;


function Main(props) {
  const [state, dispatch, getState] = useEnhancedReducer(
    rootReducer, initState(),
  );
  window.getState = getState;
  window.dispatch = dispatch;

  // responsive window size
  useEffect(() => {
    const canvas = document.getElementById('canvas');
    const ctx =  canvas.getContext('2d');
    dispatch({ctx});
  }, []);
  useResponsiveDimensions((width, height) => {
    dispatch({windowDims: {width, height}});
  });

  // rendering
  useEffect(() => {
    if (!state?.ctx) return;
    render(getState());
  }, [state.ctx, state.windowDims, state.canvasDims]);

  return (
    <div
      style={{
        backgroundColor: 'gray',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          height: state.windowDims.height - config.colorBarHeight,
        }}
      >
        <ToolBar state={state} dispatch={dispatch} getState={getState} />
        <PaintArea state={state} dispatch={dispatch} getState={getState} />
      </div>
      <ColorBar state={state} dispatch={dispatch} getState={getState} />

      {state.modal}
    </div>
  );
}







module.exports = Main;
