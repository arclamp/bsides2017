import { drag } from 'd3-drag';
import { event,
         select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { area,
         stack } from 'd3-shape';

import VisComponent from 'candela/VisComponent';

import content from './index.jade';
import './index.styl';
import DataWindow, { SliceWindow } from '~/util/DataWindow';
import Clusters from '~/util/Clusters';
import { action,
         store,
         observeStore } from '~/redux';

export default class Chart extends VisComponent {
  constructor (el, options) {
    super(el, options);

    this.interval = options.interval;
    this.color = options.color;

    const size = 100;

    this.data = new DataWindow({
      size
    });

    this.clusters = new Clusters();

    options.dataWindow.on('added', d => this.add(d));
    options.dataWindow.on('deleted', d => this.remove(d));

    this.slider = new SliceWindow({
      size: 30,
      dataWindow: options.dataWindow
    });

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
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)
      .select('g.layers');

    this.scale = {
      x: scaleLinear().range([0, this.width]).domain([0, size]),
      y: scaleLinear().range([this.height, 0]).domain([0, 100])
    };

    this.stack = stack();

    this.area = area()
      .x((d, i) => this.scale.x(i))
      .y0(d => this.scale.y(d[0]))
      .y1(d => this.scale.y(d[1]));

    const sliderDrag = drag()
      .on('start', () => {
        console.log('drag start');
      })
      .on('drag', function () {
        console.log(event.dx);
        console.log(this);
        const x = +select(this).attr('x');
        console.log('x', x);
        select(this).attr('x', x + event.dx);
      })
      .on('end', () => {
        console.log('drag end');
      });

    select(this.el)
      .select('rect.slider')
      .attr('rx', 10)
      .attr('ry', 10)
      .call(sliderDrag);

    observeStore(next => {
      const cluster = next.get('selected');
      select(this.el)
        .selectAll('path.area')
        .classed('selected', function () {
          const myCluster = select(this).attr('data-cluster');
          const selected = myCluster && myCluster === cluster;

          if (selected) {
            const g = this.parentNode;
            g.parentNode.appendChild(g);
          }

          return selected;
        });
    }, s => s.get('selected'));
  }

  render () {
    // Add counts to data stream.
    let counts = {
      normal: this.clusters.count()
    };
    let keys = ['normal'];
    this.clusters.anomalousCounts().forEach((c, i) => {
      counts[i] = c;
      keys.push(String(i));
    });

    this.data.add(counts);

    this.data.data.forEach(d => {
      keys.forEach(key => {
        d[key] = d[key] || 0;
      });
    });

    const stacks = this.stack.keys(keys)(this.data.data);

    const layer = this.chart
      .selectAll('g.layer')
      .data(stacks, d => d.key);

    layer.exit()
      .remove();

    layer.enter()
      .append('g')
      .classed('layer', true)
      .append('path')
      .classed('area', true)
      .style('fill', (d, i) => {
        if (d.key === 'normal') {
          return 'gray';
        } else {
          return this.color(d.key);
        }
      })
      .attr('data-cluster', d => {
        if (d.key === 'normal') {
          return 'non-anomalous';
        } else {
          return d.key;
        }
      })
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

    this.chart.selectAll('path')
      .data(stacks, d => d.key)
      .attr('d', this.area);

    // Update the slider window.
    const startX = Math.max(this.slider.currentPosition, 0);
    let width = this.slider.size;
    if (this.slider.currentPosition < 0) {
      width += this.slider.currentPosition;
    }

    select(this.el)
      .select('rect.slider')
      .attr('x', this.scale.x(startX))
      .attr('width', this.scale.x(width))
      .attr('y', this.scale.y(100) - 5)
      .attr('height', this.scale.y(0) + 10);
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
