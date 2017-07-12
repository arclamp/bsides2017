import { select } from 'd3-selection';
import { scaleLinear,
         scaleOrdinal,
         schemeCategory20 } from 'd3-scale';
import { area,
         stack } from 'd3-shape';

import VisComponent from 'candela/VisComponent';

import content from './index.jade';
import DataWindow from '~/util/DataWindow';
import Clusters from '~/util/Clusters';

export default class Chart extends VisComponent {
  constructor (el, options) {
    super(el, options);

    this.interval = options.interval;

    const size = 100;

    this.data = new DataWindow({
      size
    });
    this.clusters = new Clusters();

    options.dataWindow.on('added', d => this.add(d));
    options.dataWindow.on('deleted', d => this.remove(d));

    this.margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 50
    };

    const svg = select(this.el)
      .html(content({
        width: 620.5,
        height: 400
      }))
      .select('svg');

    this.width = svg.attr('width') - this.margin.left - this.margin.right;
    this.height = svg.attr('height') - this.margin.top - this.margin.bottom;

    this.chart = svg.select('.chart')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    const x = scaleLinear().range([0, this.width]).domain([0, size]);
    const y = scaleLinear().range([this.height, 0]).domain([0, 100]);

    this.stack = stack();

    window.area = this.area = area()
      .x((d, i) => x(i))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]));

    this.color = scaleOrdinal(schemeCategory20);
  }

  render () {
    // Add counts to data stream.
    let counts = {
      normal: this.clusters.count()
    };
    this.clusters.anomalousCounts().forEach((c, i) => {
      counts[`Cluster ${i}`] = c;
    });

    this.data.add(counts);

    const keys = Object.keys(counts);

    this.data.data.forEach(d => {
      keys.forEach(key => {
        d[key] = d[key] || 0;
      });
    });

    const stacks = this.stack.keys(keys)(this.data.data);

    this.chart.selectAll('*')
      .remove();

    const layer = this.chart.selectAll('.layer')
      .data(stacks);

    layer.exit()
      .remove();

    layer.enter()
      .append('g')
      .classed('layer', true)
      .append('path')
      .classed('area', true)
      .merge(layer)
      .style('fill', d => this.color(d.key))
      .attr('d', this.area);
  }

  add (d) {
    if (d.anomalous) {
      this.clusters.addAnomalous(d.cluster);
    } else {
      this.clusters.add();
    }
  }

  remove (d) {
    if (d.anomalous) {
      this.clusters.removeAnomalous(d.cluster);
    } else {
      this.clusters.remove();
    }
  }
}
