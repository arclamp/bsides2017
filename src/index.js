import { select } from 'd3-selection';

import { action,
         store,
         observeStore } from '~/redux';
import { start,
         stop } from '~/dataControl';
import Table from '~/vis/Table';
import DataWindow from '~/util/DataWindow';

import dataRaw from '../data/streaming_output.json';

import 'bootstrap/dist/js/bootstrap';
import './index.less';
import './index.styl';
import content from './index.jade';

// Install the main page content.
select(document.body).html(content());

// Convert the raw data into JSON records.
const data = dataRaw.split('\n')
  .filter(x => x.length > 0)
  .map(x => JSON.parse(x));

// Kick off the application by installing the data to the store.
store.dispatch(action.setDataStream(data));

// Install action handlers
//
// Play button.
select('#play').on('click', () => {
  store.dispatch(action.start());
});

// Stop button.
select('#stop').on('click', () => {
  store.dispatch(action.stop());
});

// Rewind button.
select('#rewind').on('click', () => {
  store.dispatch(action.setDataPointer(0));
});

// Slower button.
select('#slower').on('click', () => {
  store.dispatch(action.decreaseSpeed());
});

// Faster button.
select('#faster').on('click', () => {
  store.dispatch(action.increaseSpeed());
});

// Create a data window object.
let dataWindow = new DataWindow();

// Instantiate table view.
let table = new Table(select('#table').node(), {
  dataWindow,
  headers: [
    'TTLs',
    'proto',
    'anomalous',
    'cluster'
  ]
});
table.render();

// Install reactive actions to changes in the store.
//
// When the data pointer changes.
observeStore(next => {
  const index = next.getIn(['datastream', 'index']);
  const data = next.getIn(['datastream', 'data'])[index];

  console.log(index, data);

  // Add the new data item to the data window.
  dataWindow.add(Object.assign({
    index
  }, data));

  // Re-render the table view.
  table.render();

  // Disable the rewind button whenever playback is at the very start of the
  // data.
  select('#rewind').attr('disabled', index === 0 ? true : null);
}, s => s.getIn(['datastream', 'index']));

// When the playback speed changes.
observeStore(next => {
  const interval = next.getIn(['playback', 'interval']);
  if (next.getIn(['playback', 'running'])) {
    start(interval);
  }

  // Disable the speed change buttons if the speed reaches the ends of the
  // range.
  if (interval === next.getIn(['playback', 'intervalHigh'])) {
    select('#slower').attr('disabled', true);
  } else if (interval === next.getIn(['playback', 'intervalLow'])) {
    select('#faster').attr('disabled', true);
  } else {
    select('#slower').attr('disabled', null);
    select('#faster').attr('disabled', null);
  }
}, s => s.getIn(['playback', 'interval']));

// When the playback state changes.
observeStore(next => {
  const running = next.getIn(['playback', 'running']);

  // Start/stop playback as needed.
  if (running) {
    start(next.getIn(['playback', 'interval']));
  } else {
    stop();
  }

  // Disable the play/stop buttons to reflect the playback state.
  select('#play').attr('disabled', running ? true : null);
  select('#stop').attr('disabled', running ? null : true);
}, s => s.getIn(['playback', 'running']));
