import Immutable from 'immutable';

import { actionType } from '../action';

const initial = Immutable.fromJS({
  datastream: {
    data: null,
    index: 0
  }
});

const reducer = (state = initial, action = {}) => {
  let newState = state;

  if (action.type === undefined) {
    throw new Error('fatal: undefined action type');
  }

  switch (action.type) {
    case actionType.setDataStream:
      newState = state.setIn(['datastream', 'data'], Immutable.fromJS(action.data));
      break;
  }

  return newState;
};

export {
  reducer
};
