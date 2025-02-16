const { default: gfo } = await import('graph-from-osm');
import * as turf from '@turf/turf';
import * as fs from 'node:fs';

const settings = {
  bbox: [
    -122.02, 37.32,
    -121.95, 37.329 ],
  highways: [
    'motorway','trunk','primary','secondary',
    'tertiary','service','residential','pedestrian',
    'path','living_street','track'],
  timeout: 600000000, maxContentLength: 1500000000
}

const osmData = await gfo.getOsmData(settings);
const graph = gfo.osmDataToGraph(osmData);
const mapping = graph.features.reduce(
  (m, f) => {
    m[f.id] = f.properties.osmId;
    return m;
  },
  {}
);
const nodes = {};
const addEdge = (n1: number, n2: number, meters: number, id: number) => {
  const i1 = mapping[n1.toString()];
  const i2 = mapping[n2.toString()];
  (nodes[i2] ??= []).push({n_id: i1, meters, id});
  (nodes[i1] ??= []).push({n_id: i2, meters, id});
};
for (var feature of graph.features) {
  if (feature.src) {
    feature.properties.meters = turf.length(feature) * 1000; // km to meter
    addEdge(feature.src, feature.tgt, feature.properties.meters, feature.properties.osmId)
  }
}

fs.writeFile('src/assets/sc-graph.json', JSON.stringify(graph), (x) => console.log(x));
fs.writeFile('src/assets/sc-nodes.json', JSON.stringify(nodes), (x) => console.log(x));
