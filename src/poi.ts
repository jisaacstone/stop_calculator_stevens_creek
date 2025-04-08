import Feature from 'ol/Feature.js';
import { GeoJSON } from 'ol/format.js';
import { Point } from 'ol/geom.js';
import { Text } from 'ol/style.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';

import * as turf from '@turf/turf';
import * as GJ from 'geojson';

import * as style from 'style';
import _poiGeojson from 'assets/poi-geojson.json';

const poiGeojson = _poiGeojson as GJ.FeatureCollection<GJ.Point, GJ.GeoJsonProperties>;


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

export const pointsInPolygons = (polygons: GJ.Feature<GJ.Polygon, GJ.GeoJsonProperties>[]) => {
  const points = turf.pointsWithinPolygon(poiGeojson, turf.featureCollection(polygons));
  return points;
};
