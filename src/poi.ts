import Feature from 'ol/Feature.js';
import { GeoJSON } from 'ol/format.js';
import { Point } from 'ol/geom.js';
import { Text } from 'ol/style.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';

import * as style from 'style';
import poiGeojson from 'assets/poi-geojson.json';


const GeoJsonFormat = new GeoJSON<Feature<Point>>();
const source = new VectorSource({
    format: GeoJsonFormat,
    features: GeoJsonFormat.readFeatures(
      poiGeojson
    )
  });

export const layer = new VectorLayer({
  source: source,
  style: (f, res) => {
    const stl = style.poi(5, res);
    if (res < .00001) {
      stl.setText(new Text({text: f.get('name'), font: '12px Calibri,sans-serif'}));
    }
    return stl;
  }
});
