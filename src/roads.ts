import { default as OlMap } from 'ol/Map.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Coordinate} from 'ol/coordinate.js';
import Feature from 'ol/Feature.js';
import {LineString} from 'ol/geom.js';
import {GeoJSON} from 'ol/format.js';

import * as turf from '@turf/turf';

import * as style from 'style';

const format = new GeoJSON<Feature<LineString>>();

export const getLayer = (() => {
  let cache: null | Promise<{ source: VectorSource<Feature<LineString>>, layer: VectorLayer}> = null;
  const loadLayerData = async () => {
    console.log('importing');
    const scGeojson = (await import('assets/sc-geojson')).default;
    console.log('imported');
    const features: Feature<LineString>[] = format.readFeatures(
      scGeojson,
      {featureProjection: 'EPSG:4326'}
    );
    const source = new VectorSource<Feature<LineString>>({ format, features });

    const layer = new VectorLayer({
      source,
      style: style.road
    });
    return { source, layer };
  };
  const setup = async () => {
    if (!cache) {
      cache = loadLayerData();
    }
    return cache;
  };
  return setup;
})();

export const closestPoint = async (coord: Coordinate): { feature: Feature, point: Coordinate } => {
  const { source } = await getLayer();
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
    coord
  );
  return { feature: found, point: point.geometry.coordinates };
}
