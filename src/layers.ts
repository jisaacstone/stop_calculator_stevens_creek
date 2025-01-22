import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Fill, Stroke, Style} from 'ol/style.js';
import {GeoJSON} from 'ol/format.js';
import gridJson from 'assets/00grid.json';

const osmSource = new OSM();
const outline = new Stroke({ color: [45, 45, 45, 0.1] });
console.log(gridJson);

export const osmRaster = new TileLayer({
  source: osmSource,
  opacity: 0.2,
});

export const clip = new VectorLayer({
  source: new VectorSource({wrapX: false}),
  style: (feature) => {
    const sc = feature.get('cat') === 'overlap' ? [174, 45, 218, 0.9] : [21, 41, 180, 0.5];
    console.log(feature);
    return [new Style({ stroke: outline, fill: new Fill({ color: sc }) })];
  }
});

export const grid = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    features: new GeoJSON().readFeatures(
      gridJson,
      {featureProjection: osmSource.getProjection() || 'EPSG:4269'}
    ),
  }),
  style: new Style({
    fill: new Fill({
      color: 'black',
    }),
    stroke: new Stroke({
      color: '#5B9',
    })
  })
});
