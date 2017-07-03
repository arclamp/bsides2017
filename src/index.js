import { action,
         store,
         observeStore } from './redux';

import dataRaw from '../data/streaming_output.json';

const data = dataRaw.split("\n")
  .filter(x => x.length > 0)
  .map(x => JSON.parse(x));

console.log(data);
