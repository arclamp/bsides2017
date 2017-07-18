import Events from 'candela/plugins/mixin/Events';

class A {}

export default class DataWindow extends Events(A) {
  constructor ({size = 10, initial = []} = {}) {
    super();

    this.size = size;
    this.data = initial;
  }

  add (d) {
    let deleted = null;

    this.data.push(d);
    if (this.data.length > this.size) {
      deleted = this.data[0];
      this.data = this.data.slice(1);
    }

    this.emit('added', d);
    this.emit('deleted', deleted);
  }
}

export class SliceWindow extends Events(A) {
  constructor ({start, size = 10, dataWindow} = {}) {
    super();

    if (start === undefined) {
      start = dataWindow.size - size;
    }

    this.data = [];

    // Save the target, start point, and size.
    this.dataWindow = dataWindow;
    this.start = start;
    this.size = size;

    // Hydrate the slice data with as much data as is available in the target
    // data window.
    this._hydrate();

    // React to data additions in the target data window; deletions occur
    // naturally, as data is pushed out of the slice's window.
    dataWindow.on('added', d => {
      if (dataWindow.data.length <= this.start + this.size) {
        let deleted = null;
        this.data.push(d);
        if (this.data.length > this.size) {
          deleted = this.data[0];
          this.data = this.data.slice(1);
        }
        this.emit('added', d);
        if (deleted) {
          this.emit('deleted', deleted);
        }
      } else if (this.filled) {
        const oldDatum = this.data[0];
        const newDatum = this.dataWindow.data[this.start + this.size - 1];

        this.data.push(newDatum);
        this.data = this.data.slice(1);

        this.emit('added', newDatum);
        this.emit('deleted', oldDatum);
      } else if (dataWindow.data.length === dataWindow.size) {
        this.filled = true;
      }
    });
  }

  setStart (start) {
    if (this.start !== start) {
      this.start = start;
      this._hydrate();

      this.emit('changed', this.data);
    }
  }

  setSize (size) {
    if (this.size !== size) {
      this.size = size;
      this._hydrate();

      this.emit('changed', this.data);
    }
  }

  _hydrate () {
    if (this.dataWindow.data.length >= this.start + this.size) {
      this.data = this.dataWindow.data.slice(this.start, this.start + this.size);
      this.filled = this.start + this.size;
    } else {
      this.data = this.dataWindow.data.slice(-1 * this.size);
      this.filled = this.data.length;
    }
  }
}
