
const React = require('react');
const {
  Button, Modal,
  Canvas, RadioPicker,
} = require('bens_ui_components');
const SettingsModal = require('./SettingsModal.react');
const {config} = require('../config');
const {useEffect, useState, useMemo} = React;


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
        textAlign: 'center',
      }}
    >
      <Button
        label="Settings"
        onClick={() => {
          dispatch({type: 'SET_MODAL', modal: <SettingsModal {...props} />});
        }}
      />
      <Button
        label="Undo"
        onClick={() => {
          dispatch({type: 'UNDO'});
        }}
      />
      <Button
        label="Redo"
        onClick={() => {
          dispatch({type: 'REDO'});
        }}
      />
      <div
        style={{
          marginTop: 5,
          marginBottom: 5,
        }}
      >Tools</div>

      {toolButtons}

      <ToolParameters {...props} />

    </div>
  );
};

const ToolParameters = (props) => {
  const {state, dispatch} = props;

  let content = null;
  if (state.tool == 'PIPETTE') {
    content = (
      <div
        style={{
          backgroundColor: state.colorPreview,
          width: 25,
          height: 25,
          margin: 'auto',
          marginTop: 5,
        }}
      >

      </div>
    );
  }

  return (
    <div
      style={{
        margin: '5px',
        backgroundColor: 'ghostwhite',
        height: 200,
        border: '4px inset grey',
      }}
    >
      {content}
    </div>
  );
};


module.exports = ToolBar;
