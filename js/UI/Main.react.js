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
    dispatch({
      ctx,
      imageData: ctx.createImageData(state.canvasDims.width, state.canvasDims.height),
    });
  }, [state.canvasDims]);
  useResponsiveDimensions((width, height) => {
    dispatch({windowDims: {width, height}});
    if (state?.ctx) {
      render(state);
    }
  });

  // rendering
  useEffect(() => {
    if (!state?.ctx) return;
    render(state);
  }, [state.ctx, state.actions]);

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

const ToolBar = (props) => {
  const {state, dispatch, getState} = props;

  const toolButtons = [];
  for (const tool of config.tools) {
    toolButtons.push(<Button
      key={"toolButton_" + tool}
      disabled={state.tool == tool}
      label={tool}
      onClick={() => dispatch({tool})}
    />);
  }

  return (
    <div
      style={{
        width: config.toolBarWidth,
        height: '100%',
        borderRight: '1px solid black',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {toolButtons}

    </div>
  );
};

const div = (pos, size) => {
  return {x: pos.x / size.width, y: pos.y / size.height};
}

const PaintArea = (props) => {
  const {state, dispatch, getState} = props;
  const {canvasDims, windowDims} = state;

  useMouseHandler(
    "canvas", {dispatch, getState},
    {
      leftDown: (state, dispatch, pos) => {
        console.log("click", pos);
      },
      mouseMove: (state, dispatch, gridPos) => {
        if (!state?.mouse?.isLeftDown) return;
        dispatch({inMove: true});

        const {canvasDims} = state;
        if (state.prevInteractPos) {
          const prevPos = state.prevInteractPos;
          dispatch({type: 'STROKE',
            start: div(prevPos, canvasDims),
            end: div(gridPos, canvasDims),
            color: state.color,
            thickness: state.thickness,
          });
          dispatch({prevInteractPos: gridPos});
        } else {
          dispatch({prevInteractPos: gridPos});
        }
      },
      leftUp: (state, dispatch, gridPos) => {
        dispatch({inMove: false});
        dispatch({prevInteractPos: null});
      },
    },
  );

  return (
    <div
      style={{
        width: windowDims.width - config.toolBarWidth,
        height: '100%',
        backgroundColor: 'lightgray',
      }}
    >
      <Canvas
        width={windowDims.width - config.toolBarWidth}
        height={windowDims.height - config.colorBarHeight}
      />

    </div>
  );
};

const ColorBar = (props) => {
  const {state, dispatch, getState} = props;

  const colorButtons = [];
  for (const color of config.colors) {
    colorButtons.push(<Button
      key={"colorButton_" + color}
      id={"colorButton_" + color}
      disabled={state.color == color}
      style={{
        backgroundColor: color,
        width: 20,
        height: 20,
      }}
      label={""}
      onClick={() => dispatch({color})}
    />);
  }

  return (
    <div
      style={{
        width: '100%',
        height: config.colorBarHeight,
        borderTop: '1px solid black',
        paddingTop: 10,
        paddingLeft: 10,
      }}
    >

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <div
          style={{
            backgroundColor: state.color,
            width: 25,
            height: 25,
            marginRight: 10,
          }}
        >
        </div>
        {colorButtons}
      </div>

    </div>
  );
};





module.exports = Main;
