import { easeLinear } from 'd3-ease';
import { pack } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';

import VisComponent from 'candela/VisComponent';

import content from './index.jade';
import './index.styl';
import Clusters from '~/util/Clusters';
import { SliceWindow } from '~/util/DataWindow';
import { action,
         store,
         observeStore } from '~/redux';

export default class Bubble extends VisComponent {
  constructor (el, options) {
    super(el, options);

    // Retain a function that specifies what the interval is between data
    // updates.
    this.interval = options.interval || (() => 0);

    // Grab a colormap object from the options.
    this.color = options.color;

    // Construct an initial hierarchy.
    this.data = new Clusters();

    const width = 620.5;
    const height = 400;
    select(this.el)
      .html(content({
        width,
        height
      }));

    this.bubbles = pack()
      .size([width, height])
      .padding(3);

    options.chart.on('slider', (pos, data, counts) => {
      Object.keys(counts).forEach(key => {
        if (key === 'normal') {
          this.data.set(counts.normal);
        } else {
          this.data.setAnomalous(+key, counts[key]);
        }
      });

      this.render();
    });

    observeStore(next => {
      const cluster = next.get('selected');
      select(this.el)
        .selectAll('circle')
        .classed('selected', function () {
          const myCluster = select(this).attr('data-cluster');
          return myCluster && myCluster === cluster;
        });
    }, s => s.get('selected'));
  }

  render () {
    const root = this.bubbles(this.data.hierarchy());

    select(this.el)
      .select('svg')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .append('circle')
      .attr('data-cluster', d => d.data.cluster)
      .on('click', function (d) {
        const which = select(this).attr('data-cluster');
        if (which === 'undefined' || which === 'anomalous') {
          store.dispatch(action.unselect());
        } else {
          const selected = select(this).classed('selected');
          if (selected) {
            store.dispatch(action.unselect());
          } else {
            store.dispatch(action.select(which));
          }
        }
      });

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
          return this.color(d.data.cluster);
        }
      });
  }
}
