import { hierarchy } from 'd3-hierarchy';

export default class Clusters {
  constructor () {
    this.data = {
      children: [
        {
          cluster: 'non-anomalous',
          value: 0
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

  set (count) {
    this.data.children[0].value = count;
  }

  addAnomalous (cluster) {
    this.ensureCluster(cluster);
    this.data.children[cluster + 1].value++;
  }

  removeAnomalous (cluster) {
    this.data.children[cluster + 1].value--;
  }

  setAnomalous (cluster, count) {
    this.ensureCluster(cluster);
    this.data.children[cluster + 1].value = count;
  }

  ensureCluster (cluster) {
    if (this.data.children.length <= cluster + 1) {
      for (let i = this.data.children.length; i < cluster + 2; i++) {
        this.data.children[i] = {
          cluster: i - 1,
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
    return this.data.children.slice(1)
      .sort((a, b) => a.cluster - b.cluster)
      .map(d => d.value);
  }
}
