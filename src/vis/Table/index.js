import { select } from 'd3-selection';

import VisComponent from 'candela/VisComponent';
import content from './index.jade';
import row from './row.jade';
import stringToElement from '~/util/stringToElement';

export default class Table extends VisComponent {
  constructor (el, options) {
    super(el, options);

    this.dataWindow = options.dataWindow;

    select(this.el).html(content());
  }

  render () {
    const sel = select(this.el)
      .select('tbody.table-body')
      .selectAll('tr')
      .data(this.dataWindow.data, d => d.index);

    sel.enter()
      .append(d => stringToElement(row(d)));

    sel.exit()
      .remove();
  }
}
