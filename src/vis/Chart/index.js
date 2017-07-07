import { select } from 'd3-selection';

import VisComponent from 'candela/VisComponent';

export default class Chart extends VisComponent {
  constructor (el, options) {
    super(el, options);

    this.dataWindow = options.dataWindow;

    select(this.el)
      .style('height', '400px')
      .style('background', 'firebrick');
  }

  render () {
    console.log('Chart.render()');
  }
}
