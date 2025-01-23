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
    const sc = feature.get('cat') === 'overlap' ? [194, 95, 238, 0.7] : [246, 245, 245, 1];
    return [new Style({ stroke: outline, fill: new Fill({ color: sc }) })];
  },
  zIndex: 2
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
    stroke: new Stroke({
      color: [106, 184, 131, 1],
      width: 2
    })
  }),
  zIndex: 3
});
export const grid2 = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    features: new GeoJSON().readFeatures(
      gridJson,
      {featureProjection: osmSource.getProjection() || 'EPSG:4269'}
    ),
  }),
  style: new Style({
    stroke: new Stroke({
      color: [216, 224, 231, 1],
      width: 2
    })
  }),
  zIndex: 1
});

//new CSS({ blend: 'hue' }).addToLayer(clip);
//clip.on('precompose', (evt) => { evt.context.globalCompositeOperation = 'hue' });
//clip.on('postcompose', (evt) => { evt.context.globalCompositeOperation = 'source-over' });
