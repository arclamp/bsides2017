import { action,
         store } from '~/redux';

let ival = null;

function start (delay = 1000) {
  stop();
  ival = window.setInterval(() => store.dispatch(action.advanceDataPointer()), delay);
}

function stop () {
  if (ival) {
    window.clearInterval(ival);
  }
}

export {
  start,
  stop
};
