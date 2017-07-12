import { hierarchy } from 'd3-hierarchy';

export default class Clusters {
  constructor () {
    this.data = {
      children: [
        {
          cluster: 'non-anomalous',
          value: 0
        },
        {
          cluster: 'anomalous',
          value: 0,
          children: []
        }
      ]
    };
  }

  add () {
    this.data.children[0].value++;
  }

  remove () {
    this.data.children[0].value--;
  }

  addAnomalous (cluster) {
    this.ensureCluster(cluster);
    this.data.children[1].children[cluster].value++;
  }

  removeAnomalous (cluster) {
    this.data.children[1].children[cluster].value--;
  }

  ensureCluster (cluster) {
    if (this.data.children[1].children.length <= cluster) {
      for (let i = this.data.children[1].children.length; i < cluster + 1; i++) {
        this.data.children[1].children[i] = {
          cluster: i,
          value: 0
        };
      }
    }
  }

  hierarchy () {
    return hierarchy(this.data)
      .sum(d => d.value || 0.01);
  }

  count () {
    return this.data.children[0].value;
  }

  anomalousCounts () {
    return this.data.children[1].children
      .sort((a, b) => a.cluster - b.cluster)
      .map(d => d.value);
  }
}
