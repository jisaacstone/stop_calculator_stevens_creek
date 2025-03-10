import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Coordinate} from 'ol/coordinate.js';
import {toLonLat} from 'ol/proj';
import Feature from 'ol/Feature.js';
import {LineString} from 'ol/geom.js';
import {GeoJSON} from 'ol/format.js';
import * as turf from '@turf/turf';
import scGeojson from 'assets/sc-geojson.ts';
import * as style from 'style';

const mainRoads = ['West San Carlos Street', 'Stevens Creek Boulevard'];
const format = new GeoJSON<Feature<LineString>>();

const features: Feature<LineString>[] = format.readFeatures(
  scGeojson,
  {featureProjection: 'EPSG:4326'}
);
const source = new VectorSource<Feature<LineString>>({ format, features });

export const scRoadGraph = new VectorLayer({
  source,
  style: (feature) => {
    if (mainRoads.includes(feature.get('name')) ) {
      return style.road;
    }
    return style.bldg;
  },
});

export const closestPoint = (coord: Coordinate): { feature: Feature, point: Coordinate } => {
  const found: Feature<LineString> = source.getClosestFeatureToCoordinate(coord);
  // geojson.writefeatureobject is not working so I do it manually
  const turfFound = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: found.getGeometry()?.getCoordinates()
    },
    properties: {}
  };
  const point = turf.nearestPointOnLine(
    turfFound,
    toLonLat(coord)
  );
  return { feature: found, point: point.geometry.coordinates };
}
