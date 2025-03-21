import { default as OlMap } from 'ol/Map.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Coordinate} from 'ol/coordinate.js';
import Feature from 'ol/Feature.js';
import {LineString} from 'ol/geom.js';
import {GeoJSON} from 'ol/format.js';
import { default as Select } from 'ol/interaction/Select.js';
import { click } from 'ol/events/condition.js';

import * as turf from '@turf/turf';

import scGeojson from 'assets/sc-geojson';
import * as style from 'style';
import nld from 'assets/nld';
import * as isochrone from 'isochrone';

const format = new GeoJSON<Feature<LineString>>();

export const getLayer = (() => {
  const cache: { setup: false } | { setup: true, source: VectorSource<Feature<LineString>>, layer: VectorLayer} = { setup: false };
  const setup = (): { source: VectorSource<Feature<LineString>>, layer: VectorLayer } => {
    if (!cache.setup) {
      const features: Feature<LineString>[] = format.readFeatures(
        scGeojson,
        {featureProjection: 'EPSG:4326'}
      );
      const source = new VectorSource<Feature<LineString>>({ format, features });

      const layer = new VectorLayer({
        source,
        style: style.road
      });

      Object.assign(cache, { setup: true, source, layer });

      return { source, layer };
    } else {
        return { source: cache['source'], layer: cache['layer'] };
    }
  };
  return setup;
})();

export const addSelectEvent = (map: OlMap) => {
  const roadSelect = new Select({
    condition: click,
    layers: [ getLayer().layer ],
  });
  map.addInteraction(roadSelect);
  roadSelect.on(["select"], () => {
    const selectedFeatures = roadSelect.getFeatures().getArray();
    if (!selectedFeatures || selectedFeatures.length === 0) {
      return;
    }
    const selected = selectedFeatures[0] as Feature<LineString>;
    console.log(selected);
    const link = nld.links.find((l) => l.id === selected.get('id'));
    console.log(link);
    console.log('src', isochrone.linkMap.get(link.source));
    console.log('tgt', isochrone.linkMap.get(link.target));
  });
};

export const closestPoint = (coord: Coordinate): { feature: Feature, point: Coordinate } => {
  const { source } = getLayer();
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