import { select } from 'd3-selection';

import VisComponent from 'candela/VisComponent';
import content from './index.jade';
import row from './row.jade';
import stringToElement from '~/util/stringToElement';

export default class Table extends VisComponent {
  constructor (el, options) {
    super(el, options);

    this.dataWindow = options.dataWindow;
    this.headers = options.headers;
    this.color = options.color;

    select(this.el).html(content({
      headers: this.headers
    }));
  }

  render () {
    const sel = select(this.el)
      .select('tbody.table-body')
      .selectAll('tr')
      .data(this.dataWindow.data, d => d.index);

    sel.enter()
      .append(d => stringToElement(row({
        data: d,
        headers: this.headers,
        color: this.computeColor(d)
      })));

    sel.exit()
      .remove();
  }

  computeColor (d) {
    if (!d.anomalous) {
      return 'gray';
    } else {
      return this.color(d.cluster);
    }
  }
}
