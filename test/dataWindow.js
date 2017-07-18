import test from 'tape-catch';

import DataWindow, { SliceWindow } from '~/util/DataWindow';

test('dummy test', t => {

  t.ok(DataWindow, 'DataWindow exists');
  t.equal(typeof DataWindow, 'function', 'DataWindow is a function');

  t.ok(SliceWindow, 'SliceWindow exists');
  t.equal(typeof SliceWindow, 'function', 'SliceWindow is a function');

  t.end();
});
