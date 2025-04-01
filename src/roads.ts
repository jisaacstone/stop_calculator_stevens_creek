import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Coordinate} from 'ol/coordinate.js';
import Feature from 'ol/Feature.js';
import {LineString} from 'ol/geom.js';
import {GeoJSON} from 'ol/format.js';
import * as GJ from 'geojson';

import * as turf from '@turf/turf';

import * as style from 'style';
import { withLoader } from 'loader';

const format = new GeoJSON<Feature<LineString>>();

export const loadLayer = (() => {
  let cache: null | Promise<{ source: VectorSource<Feature<LineString>>, layer: VectorLayer}> = null;
  const importModule = async() => {
    console.log('importing');
    const scGeojson = await withLoader(() => fetch('sc-geojson.json').then(r => r.json()));
    console.log('imported', scGeojson);
    return scGeojson;
  }
  const loadLayerData = async (moduleloader: () => Promise<GJ.GeoJSON>) => {
    const scGeojson = await moduleloader();
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
  const setup = async (moduleloader: Promise<GJ.GeoJSON> = importModule) => {
    if (!cache) {
      cache = loadLayerData(moduleloader);
    }
    return cache;
  };
  return setup;
})();

export const closestPoint = async (coord: Coordinate): Promise<{ feature: Feature<LineString>, point: Coordinate }> => {
  const { source } = await loadLayer();
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
