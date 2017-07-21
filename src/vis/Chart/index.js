import { drag } from 'd3-drag';
import { event,
         select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { area,
         stack } from 'd3-shape';

import VisComponent from 'candela/VisComponent';
import Events from 'candela/plugins/mixin/Events';

import content from './index.jade';
import './index.styl';
import DataWindow, { SliceWindow } from '~/util/DataWindow';
import Clusters from '~/util/Clusters';
import { action,
         store,
         observeStore } from '~/redux';

export default class Chart extends Events(VisComponent) {
  constructor (el, options) {
    super(el, options);

    this.interval = options.interval;
    this.color = options.color;
    this.history = options.history;
    this.windowSize = options.windowSize;

    this.data = new DataWindow({
      size: this.history
    });

    this.records = new DataWindow({
      size: this.windowSize + this.history - 1,
      initial: Array(this.windowSize)
    });

    this.last = new SliceWindow({
      dataWindow: this.records,
      size: this.windowSize
    });

    this.last.on('added', d => this.add(d));
    this.last.on('deleted', d => this.remove(d));

    this.clusters = new Clusters();

    this.sliderAutoUpdate = true;

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
      x: scaleLinear().range([0, this.width]).domain([0, this.history]),
      y: scaleLinear().range([this.height, 0]).domain([0, this.windowSize])
    };

    this.stack = stack();

    this.area = area()
      .x((d, i) => this.scale.x(i))
      .y0(d => this.scale.y(d[0]))
      .y1(d => this.scale.y(d[1]));

    const sliderDrag = (() => {
      const self = this;

      let curX;

      return drag()
        .on('start', function () {
          curX = +select(this)
            .select('circle')
            .attr('cx');
        })
        .on('drag', function () {
          const g = select(this);
          const circle = g.select('circle');
          const line = g.select('line');

          curX += event.dx;

          // Truncate the slider position to an integer value lying between 0
          // and the number of elements in the history window.
          let sliderAutoUpdate = false;
          let truncX = Math.floor(self.scale.x.invert(curX));
          if (truncX > self.data.data.length - 1) {
            truncX = self.data.data.length - 1;
            sliderAutoUpdate = true;
          } else if (truncX < 0) {
            truncX = 0;
          }
          truncX = self.scale.x(truncX);

          circle.attr('cx', truncX);
          line.attr('x1', truncX)
            .attr('x2', truncX);

          self.sliderAutoUpdate = sliderAutoUpdate;

          self.emitSlider();
        })
        .on('end', () => this.emitSlider());
    })();

    select(this.el)
      .select('g.index')
      .call(sliderDrag)
      .select('circle')
      .attr('r', 7);

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

    // Auto-update the index.
    if (this.sliderAutoUpdate) {
      const startX = this.data.data.length - 1;
      if (startX === this.data.size) {
        this.sliderAutoUpdate = false;
      }

      const idx = select(this.el)
        .select('g.index');

      idx.select('line')
        .attr('x1', this.scale.x(startX))
        .attr('y1', this.scale.y(100) - 5)
        .attr('x2', this.scale.x(startX))
        .attr('y2', this.scale.y(0) + 10);

      idx.select('circle')
        .attr('cx', this.scale.x(startX))
        .attr('cy', this.scale.y(0) + 10);
    }

    // Emit the slider info for benefit of other components.
    this.emitSlider();
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

  emitSlider () {
    const x = +select(this.el)
      .select('circle')
      .attr('cx');

    const sliceLow = Math.round(this.scale.x.invert(x));
    const sliceHigh = sliceLow + this.windowSize;

    const counts = this.data.data[sliceLow];

    const slice = this.records.data
      .slice(sliceLow, sliceHigh)
      .filter(x => x !== undefined);

    this.emit('slider', undefined, slice, counts);
  }
}
