import test from 'tape-catch';

import DataWindow, { SliceWindow } from '~/util/DataWindow';

test('DataWindow module exports', t => {

  t.ok(DataWindow, 'DataWindow exists');
  t.equal(typeof DataWindow, 'function', 'DataWindow is a function');

  t.ok(SliceWindow, 'SliceWindow exists');
  t.equal(typeof SliceWindow, 'function', 'SliceWindow is a function');

  t.end();
});

test('DataWindow behavior', t => {
  let dw = new DataWindow();

  t.equal(dw.size, 10, 'Default size of DataWindow is 10');

  t.equal(dw.data.length, 0, 'Initial default DataWindow is empty');

  [1, 2, 3, 4, 5].forEach(val => dw.add(val));
  t.equal(dw.data.length, 5, 'Underfilling DataWindow: adding n items means data length of n');

  [6, 7, 8, 9, 10].forEach(val => dw.add(val));
  t.equal(dw.data.length, 10, 'Filling DataWindow to capacity: adding n items means data length of n');

  [11, 12, 13, 14].forEach(val => dw.add(val));
  t.equal(dw.data.length, 10, 'Overfilling DataWindow: adding more items means maximum data length');

  let dw2 = new DataWindow({
    size: 15,
    initial: [1, 2, 3, 4]
  });

  t.equal(dw2.size, 15, 'Initializing DataWindow with size allocates the right size');
  t.deepEqual(dw2.data, [1, 2, 3, 4], 'Initializing DataWindow with data installs that data');

  t.end();
});
