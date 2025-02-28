import {OSM} from 'ol/source.js';
import {Tile as TileLayer} from 'ol/layer.js';

const osmSource = new OSM();

export const osmRaster = new TileLayer({
  source: osmSource,
  opacity: 0.2,
});