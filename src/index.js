import { select } from 'd3-selection';

import { action,
         store,
         observeStore } from '~/redux';
import { start,
         stop } from '~/dataControl';

import dataRaw from '../data/streaming_output.json';

import 'bootstrap/dist/js/bootstrap';
import './index.less';
import './index.styl';
import content from './index.jade';

select(document.body).html(content());

const data = dataRaw.split('\n')
  .filter(x => x.length > 0)
  .map(x => JSON.parse(x));

store.dispatch(action.setDataStream(data));

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

observeStore(next => {
  const index = next.getIn(['datastream', 'index']);
  console.log(index);

  select('#rewind').attr('disabled', index === 0 ? true : null);
}, s => s.getIn(['datastream', 'index']));

observeStore(next => {
  const interval = next.getIn(['playback', 'interval']);
  if (next.getIn(['playback', 'running'])) {
    start(interval);
  }

  if (interval === next.getIn(['playback', 'intervalHigh'])) {
    select('#slower').attr('disabled', true);
  } else if (interval === next.getIn(['playback', 'intervalLow'])) {
    select('#faster').attr('disabled', true);
  } else {
    select('#slower').attr('disabled', null);
    select('#faster').attr('disabled', null);
  }
}, s => s.getIn(['playback', 'interval']));

observeStore(next => {
  const running = next.getIn(['playback', 'running']);

  if (running) {
    start(next.getIn(['playback', 'interval']));
  } else {
    stop();
  }

  select('#play').attr('disabled', running ? true : null);
  select('#stop').attr('disabled', running ? null : true);
}, s => s.getIn(['playback', 'running']));
