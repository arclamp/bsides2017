import { select } from 'd3-selection';

import VisComponent from 'candela/VisComponent';
import stringToElement from '~/util/stringToElement';
import { observeStore } from '~/redux';

import content from './index.jade';
import row from './row.jade';
import './index.styl';

export default class Table extends VisComponent {
  constructor (el, options) {
    super(el, options);

    this.dataWindow = options.dataWindow;
    this.headers = options.headers;
    this.color = options.color;

    select(this.el).html(content({
      headers: this.headers
    }));

    observeStore(next => {
      this.filter = next.get('selected');
      this.render();
    }, s => s.get('selected'));
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
      })))
      .merge(sel)
      .classed('hidden', d => {
        if (this.filter === null) {
          return false;
        } else if (this.filter === 'non-anomalous') {
          return d.anomalous;
        } else {
          return d.cluster !== +this.filter;
        }
      });

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
