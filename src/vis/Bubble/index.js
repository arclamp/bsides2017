import { easeLinear } from 'd3-ease';
import { pack } from 'd3-hierarchy';
import { scaleOrdinal,
         schemeCategory20 } from 'd3-scale';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';

import VisComponent from 'candela/VisComponent';

import content from './index.jade';
import Clusters from '~/util/Clusters';

export default class Bubble extends VisComponent {
  constructor (el, options) {
    super(el, options);

    // Respond to "add" and "delete" events from the data window; these are all
    // that will be needed to update the hierarchy data.
    options.dataWindow.on('added', d => this.add(d));
    options.dataWindow.on('deleted', d => this.remove(d));

    // Retain a function that specifies what the interval is between data
    // updates.
    this.interval = options.interval || (() => 0);

    // Construct an initial hierarchy.
    this.data = new Clusters();

    select(this.el)
      .html(content({
        width: '620.5px',
        height: '400px'
      }));
  }

  render () {
    let bubbles = pack()
      .size([620.5, 400])
      .padding(3);

    const root = bubbles(this.data.hierarchy());
    const color = scaleOrdinal(schemeCategory20);

    select(this.el)
      .select('svg')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .append('circle')
      .style('stroke-width', '1px')
      .style('stroke', 'black');

    const t = transition()
      .duration(this.interval())
      .ease(easeLinear);

    select(this.el)
      .select('svg')
      .selectAll('g')
      .transition(t)
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    select(this.el)
      .select('svg')
      .selectAll('g')
      .select('circle')
      .transition(t)
      .attr('r', d => d.r)
      .style('fill', (d, i) => {
        if (d.depth === 0) {
          return 'lightgray';
        } else if (d.depth === 1) {
          return 'gray';
        } else {
          return color(d.data.cluster);
        }
      });
  }

  add (d) {
    if (d.anomalous) {
      this.data.addAnomalous(d.cluster);
    } else {
      this.data.add();
    }
  }

  remove (d) {
    if (d.anomalous) {
      this.data.removeAnomalous(d.cluster);
    } else {
      this.data.remove();
    }
  }
}
