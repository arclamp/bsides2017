import test from 'tape-catch';

import DataWindow, { SliceWindow } from '~/util/DataWindow';

test('DataWindow module exports', t => {
  t.ok(DataWindow, 'DataWindow exists');
  t.equal(typeof DataWindow, 'function', 'DataWindow is a function');

  t.ok(SliceWindow, 'SliceWindow exists');
  t.equal(typeof SliceWindow, 'function', 'SliceWindow is a function');

  t.end();
});

test('Uninitialized DataWindow behavior', t => {
  let dw = new DataWindow();

  t.equal(dw.size, 10, 'Default size of DataWindow is 10');

  t.equal(dw.data.length, 0, 'Initial default DataWindow is empty');

  [1, 2, 3, 4, 5].forEach(val => dw.add(val));
  t.equal(dw.data.length, 5, 'Underfilling DataWindow: adding n items means data length of n');

  [6, 7, 8, 9, 10].forEach(val => dw.add(val));
  t.equal(dw.data.length, 10, 'Filling DataWindow to capacity: adding n items means data length of n');

  [11, 12, 13, 14].forEach(val => dw.add(val));
  t.equal(dw.data.length, 10, 'Overfilling DataWindow: adding more items means maximum data length');

  t.end();
});

test('Initialized DataWindow behavior', t => {
  let dw2 = new DataWindow({
    size: 15,
    initial: [1, 2, 3, 4]
  });

  t.equal(dw2.size, 15, 'Initializing DataWindow with size allocates the right size');
  t.deepEqual(dw2.data, [1, 2, 3, 4], 'Initializing DataWindow with data installs that data');

  t.end();
});

test('SliceWindow default behavior', t => {
  let dw = new DataWindow({
    size: 100
  });

  let slice1 = new SliceWindow({
    size: 10,
    dataWindow: dw
  });

  const data = [...Array(100).keys()];
  const ten = data.slice(0, 10);
  ten.forEach(d => dw.add(d));

  t.deepEqual(dw.data, ten, 'DataWindow has 0..9');
  t.deepEqual(slice1.data, ten, 'SliceWindow has 0..9');

  data.slice(10).forEach(d => dw.add(d));
  t.deepEqual(dw.data, data, 'DataWindow has 0..99');
  t.deepEqual(slice1.data, data.slice(-10), 'SliceWindow has 90..99');

  dw.add(100);
  t.deepEqual(dw.data, data.map(x => x + 1), 'DataWindow has 1..100');
  t.deepEqual(slice1.data, data.slice(-10).map(x => x + 1), 'SliceWindow has 91..100');

  t.end();
});

test('SliceWindow fixed behavior', t => {
  let dw = new DataWindow({
    size: 100
  });

  let slice1 = new SliceWindow({
    start: 40,
    size: 10,
    dataWindow: dw
  });

  const data = [...Array(100).keys()];
  const forty = data.slice(0, 40);
  forty.forEach(d => dw.add(d));

  t.deepEqual(dw.data, forty, 'DataWindow has 0..39');
  t.deepEqual(slice1.data, forty.slice(-10), 'SliceWindow has 30..39');

  const toFifty = data.slice(40, 50);
  toFifty.forEach(d => dw.add(d));

  t.deepEqual(dw.data, data.slice(0, 50), 'DataWindow has 0..49');
  t.deepEqual(slice1.data, toFifty, 'SliceWindow has 40..49');

  dw.add(50);
  t.deepEqual(dw.data, data.slice(0, 51), 'DataWindow has 0..50');
  t.deepEqual(slice1.data, toFifty, 'SliceWindow still has 40..49');

  const rest = data.slice(51);
  rest.forEach(d => dw.add(d));

  t.deepEqual(dw.data, data, 'Full DataWindow has 0..99');
  t.deepEqual(slice1.data, toFifty, 'SliceWindow still has 40..49');

  dw.add(100);
  t.deepEqual(dw.data, data.map(x => x + 1), 'Overfull DataWindow has 1..100');
  t.deepEqual(slice1.data, toFifty.map(x => x + 1), 'SliceWindow has 41..50');

  t.end();
});
