import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {Fill, Stroke, Style} from 'ol/style.js';
import {GeoJSON} from 'ol/format.js';
import gridJson from 'assets/00grid.json';
import * as style from 'style';

const osmSource = new OSM();

const gridFeatures = new GeoJSON().readFeatures(
  gridJson,
  {featureProjection: osmSource.getProjection() || 'EPSG:4269'}
)

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
    const sc = cat === 'overlap' ? [194, 95, 238, 0.7] : [246, 245, 245, 0.3];
    return [new Style({ stroke: style.outline, fill: new Fill({ color: sc }) })];
  },
});

export const grid = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    features: gridFeatures,
  }),
  style: new Style({
    stroke: new Stroke({
      color: [106, 184, 131, 1],
      width: 2
    })
  }),
});
export const grid2 = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    features: gridFeatures,
  }),
  style: new Style({
    stroke: new Stroke({
      color: [216, 224, 231, 1],
      width: 2
    })
  }),
});
