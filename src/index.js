import { select } from 'd3-selection';

import { action,
         store,
         observeStore } from '~/redux';
import { start } from '~/dataControl';

import dataRaw from '../data/streaming_output.json';

import 'bootstrap/dist/js/bootstrap';
import './index.less';
import content from './index.jade';

select(document.body).html(content());

const data = dataRaw.split('\n')
  .filter(x => x.length > 0)
  .map(x => JSON.parse(x));

observeStore(next => {
  console.log(next.getIn(['datastream', 'index']));
}, s => s.getIn(['datastream', 'index']));

store.dispatch(action.setDataStream(data));

start();
