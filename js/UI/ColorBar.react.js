
const React = require('react');
const {
  Button, Modal,
  Canvas, RadioPicker,
  TextField,
} = require('bens_ui_components');
const {config} = require('../config');
const {useEffect, useState, useMemo} = React;

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
  const color2Buttons = [];
  for (const color of config.colors2) {
    color2Buttons.push(<Button
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

  const [textColor, setTextColor] = useState(state.color);
  useEffect(() => {
    setTextColor(state.color);
  }, [state.color]);

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
        <div>
          <div>
            {colorButtons}
          </div>
          <div>
            {color2Buttons}
          </div>
        </div>
        <TextField
          style={{
            marginLeft: 5,
            fontSize: 16,
          }}
          value={textColor}
          onChange={(value) => {
            setTextColor(value);
          }}
        />
        <Button
          label="Set Color"
          onClick={() => {
            dispatch({color: textColor});
          }}
        />
      </div>

    </div>
  );
};

module.exports = ColorBar;
