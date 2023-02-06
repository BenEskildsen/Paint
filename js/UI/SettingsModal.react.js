const React = require('react');
const {
  Modal, Slider, NumberField, Button
} = require('bens_ui_components');
const {render} = require('../render');
const {useEffect, useState, useMemo} = React;

const SettingsModal = (props) => {
  const {state, dispatch, getState} = props;

  const [width, setWidth] = useState(state.canvasDims.width);
  const [height, setHeight] = useState(state.canvasDims.height);

  // download
  function downloadClick() {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const dt = canvas.toDataURL('image/png');
    this.href = dt;
  }
  useEffect(() => {
    const download = document.getElementById('download');
    if (!download) return;
    download.addEventListener('click', downloadClick, false);
  }, []);

  return (
    <Modal
      style={{

      }}
      title="Settings"
      body={(
        <div
          style={{

          }}
        >
          <div>
            Width:
            <NumberField
              value={width}
              onChange={setWidth}
              onlyInt={true}
            />

            Height:
            <NumberField
              value={height}
              onChange={setHeight}
              onlyInt={true}
            />
          </div>
          <Button
            label="Clear Canvas"
            onClick={() => {
              dispatch({transactions: [], curTransaction: [], redoTransactions: []});
              dispatch({type: 'SET_CANVAS_DIMS', width, height});
              dispatch({type: 'DISMISS_MODAL'});
            }}
          />
          <div>
            <a
              id="download"
              download="canvas.png"
            >
              Download as png
            </a>
          </div>

        </div>
      )}
      buttons={[
        {label: 'Save Settings', onClick: () => {
          dispatch({type: 'SET_CANVAS_DIMS', width, height});
          dispatch({type: 'DISMISS_MODAL'});
        }},
        {label: 'Cancel', onClick: () => {
          dispatch({type: 'DISMISS_MODAL'});
        }},
      ]}
    />
  );
};

module.exports = SettingsModal;

