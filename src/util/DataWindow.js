export default class DataWindow {
  constructor ({size = 10, initial = []} = {}) {
    this.size = size;
    this.data = initial;
  }

  add (d) {
    this.data.push(d);
    if (this.data.length > this.size) {
      this.data = this.data.slice(1);
    }
  }
}
