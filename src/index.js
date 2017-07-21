import { scaleOrdinal,
         schemeCategory20 } from 'd3-scale';
import { select } from 'd3-selection';
import Slider from 'bootstrap-slider';

import { action,
         store,
         observeStore } from '~/redux';
import { start,
         stop } from '~/dataControl';
import Table from '~/vis/Table';
import Chart from '~/vis/Chart';
import Bubble from '~/vis/Bubble';
import DataWindow from '~/util/DataWindow';

import dataRaw from '../data/streaming_output.json';

import 'bootstrap/dist/js/bootstrap';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
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

// Create the speed slider.
const slider = new Slider('#speed', {
  formatter: val => `Current value: ${val}`
});

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

// Create a shared categorical colormap to use for all three vis components.
const color = scaleOrdinal(schemeCategory20);

// Create a function that reports the current interval between record updates.
const interval = () => {
  const state = store.getState();
  if (state.getIn(['playback', 'running'])) {
    return state.getIn(['playback', 'interval']);
  } else {
    return 100;
  }
};

// Instantiate chart view.
let chart = new Chart(select('#chart').node(), {
  history: 200,
  windowSize: 30,
  interval,
  color
});
chart.render();

// Instantiate table view.
let table = new Table(select('#table').node(), {
  chart,
  headers: [
    'Z',
    'rejected',
    'proto',
    'query',
    'qclass_name',
    'qtype_name',
    'rcode_name',
    'query_length',
    'cluster',
    'anomalous'
  ],
  color
});
table.render();

// Instantiate bubble view.
let bubble = new Bubble(select('#bubble').node(), {
  chart,
  interval,
  color
});
bubble.render();

// Install reactive actions to changes in the store.
//
// When the data pointer changes.
observeStore(next => {
  const index = next.getIn(['datastream', 'index']);
  const data = next.getIn(['datastream', 'data'])[index];

  // Add the new data item to the data window.
  const datum = Object.assign({
    index
  }, data);
  chart.records.add(datum);

  // Re-render the chart view.
  chart.render();

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
