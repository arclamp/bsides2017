import Immutable from 'immutable';

import { actionType } from '../action';

const initial = Immutable.fromJS({
  datastream: {
    data: null,
    index: 0
  },
  selected: null,
  playback: {
    interval: 1000,
    intervalHigh: 1000,
    intervalLow: 0,
    running: false
  }
});

const reducer = (state = initial, action = {}) => {
  let newState = state;

  if (action.type === undefined) {
    throw new Error('fatal: undefined action type');
  }

  switch (action.type) {
    case actionType.setDataStream:
      newState = state.setIn(['datastream', 'data'], action.data);
      break;

    case actionType.advanceDataPointer:
      newState = state.updateIn(['datastream', 'index'], x => (x + 1) % state.getIn(['datastream', 'data']).length);
      break;

    case actionType.setDataPointer:
      newState = state.setIn(['datastream', 'index'], action.index);
      break;

    case actionType.start:
      newState = state.setIn(['playback', 'running'], true);
      break;

    case actionType.stop:
      newState = state.setIn(['playback', 'running'], false);
      break;

    case actionType.decreaseSpeed:
      newState = state.updateIn(['playback', 'interval'], x => {
        x += 200;
        if (x > 1000) {
          x = 1000;
        }
        return x;
      });
      break;

    case actionType.increaseSpeed:
      newState = state.updateIn(['playback', 'interval'], x => {
        x -= 200;
        if (x < 0) {
          x = 0;
        }
        return x;
      });
      break;

    case actionType.select:
      newState = state.set('selected', action.cluster);
      break;

    case actionType.unselect:
      newState = state.set('selected', null);
      break;
  }

  return newState;
};

export {
  reducer
};
