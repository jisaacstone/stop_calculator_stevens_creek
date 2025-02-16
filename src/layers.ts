import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Fill, Style} from 'ol/style.js';
import {GeoJSON} from 'ol/format.js';
import gridJson from 'assets/00grid.json';
import scbJson from 'assets/scb.json';
import scbGraphJson from 'assets/sc-geojson.json';
import * as style from 'style';

console.log({ scbGraphJson });

const osmSource = new OSM();

const gridFeatures = new GeoJSON().readFeatures(
  gridJson,
  {featureProjection: osmSource.getProjection() || 'EPSG:4269'}
);
const scbFeatures = new GeoJSON().readFeatures(
  scbJson,
  {featureProjection: osmSource.getProjection() || 'EPSG:4269'}
);
const scbGraph = new GeoJSON().readFeatures(
  scbGraphJson,
  {featureProjection: osmSource.getProjection() || 'EPSG:4269'}
);

export const osmRaster = new TileLayer({
  source: osmSource,
  opacity: 0.2,
});

export const walk = new VectorLayer({
  source: new VectorSource({wrapX: false}),
  style: (feature) => {
    const cat = feature.get('cat');
    if (cat === 'station') {
      return style.circle;
    }
    if (cat === 'main') {
      return style.mainRoad;
    }
    if (cat === 'road') {
      return style.road;
    }
    const sc = cat === 'overlap' ? [194, 95, 238, 0.3] : [246, 245, 245, 0.2];
    return [new Style({ stroke: style.outline, fill: new Fill({ color: sc }) })];
  },
});

export const grid = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    features: gridFeatures,
  }),
  style: style.gridRoad
});

const mainRoads = ['West San Carlos Street', 'Stevens Creek Boulevard'];
export const scbArea = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    features: scbFeatures,
  }),
  style: (feature) => {
    const cat = feature.get('osm_type');
    const name = feature.get('name') || '';
    if (cat === 'ways_line') {
      if (mainRoads.includes(name) ) {
        return style.mainRoad;
      }
      return style.gridRoad;
    } else if (cat === 'nodes') {
      if (mainRoads.some((n) => name.startsWith(n))) {
        return style.poi;
      }
      return style.circle;
    }
    return style.bldg;
  },
});

export const scRoadGraph = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    features: scbGraph,
  }),
  style: (feature) => {
    if (mainRoads.includes(feature.get('name')) ) {
      return style.road;
    }
    return style.bldg;
  },
});
