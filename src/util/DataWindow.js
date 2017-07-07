import Events from 'candela/plugins/mixin/Events';

class A {}

export default class DataWindow extends Events(A) {
  constructor ({size = 10, initial = []} = {}) {
    super();

    this.size = size;
    this.data = initial;
  }

  add (d) {
    this.data.push(d);
    this.emit('added', d);
    if (this.data.length > this.size) {
      this.emit('deleted', this.data[0]);
      this.data = this.data.slice(1);
    }
  }
}
