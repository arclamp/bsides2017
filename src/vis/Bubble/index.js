import { hierarchy,
         pack } from 'd3-hierarchy';
import { scaleSequential,
         interpolateMagma } from 'd3-scale';
import { select } from 'd3-selection';

import VisComponent from 'candela/VisComponent';

import content from './index.jade';

export default class Bubble extends VisComponent {
  constructor (el, options) {
    super(el, options);

    // Respond to "add" and "delete" events from the data window; these are all
    // that will be needed to update the hierarchy data.
    options.dataWindow.on('added', d => this.add(d));
    options.dataWindow.on('deleted', d => this.remove(d));

    // Construct an initial hierarchy.
    this.data = {
      value: 0,
      children: [
        {
          value: 0,
          children: []
        }
      ]
    };

    select(this.el)
      .html(content({
        width: '620.5px',
        height: '400px'
      }));
  }

  render () {
    select(this.el)
      .select('svg')
      .selectAll('*')
      .remove();

    let bubbles = pack()
      .size([620.5, 400])
      .padding(3);

    let root = hierarchy(this.data)
      .sum(d => d.value || 1);

    bubbles(root);

    console.log(root.descendants());

    const color = scaleSequential(interpolateMagma)
      .domain([-4, 4]);

    const node = select(this.el)
      .select('svg')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    node.append('circle')
      .attr('r', d => d.r)
      .attr('fill', d => color(d.depth));
  }

  add (d) {
    console.log('add', d);
    this.data.value++;
    if (d.anomalous) {
      if (this.getCluster(d.cluster) === undefined) {
        this.makeCluster(d.cluster);
      }

      this.incrementCluster(d.cluster);
    }
  }

  remove (d) {
    console.log('remove', d);
    this.data.value--;
    if (d.anomalous) {
      this.decrementCluster(d.cluster);
    }
  }

  getCluster (which) {
    return this.data.children[0].children[which];
  }

  makeCluster (which) {
    this.data.children[0].children[which] = {
      value: 0
    };
  }

  incrementCluster (which) {
    this.data.children[0].children[which].value++;
  }

  decrementCluster (which) {
    this.data.children[0].children[which].value--;
  }
}
