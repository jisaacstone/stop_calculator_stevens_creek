import {LineString} from 'ol/geom.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Coordinate} from 'ol/coordinate.js';
import {fromLonLat} from 'ol/proj.js';
import Collection from 'ol/Collection.js';
import Feature from 'ol/Feature.js';

import * as style from 'style';


export type LineSegment = [Coordinate, Coordinate];

const collection: Collection<Feature> = new Collection();
const source = new VectorSource({wrapX: false, features: collection});

export const walkShedLayer = new VectorLayer({
  source: source,
  style: (_, resolution) => {
    return style.gridRoad(5, resolution);
  },
});

export const setWalkShed = (lines: LineSegment[], category: string = "walk") => {
  collection.clear();
  const features = lines.map(l => new Feature({ geometry: new LineString([fromLonLat(l[0]), fromLonLat(l[1])]), category }));
  console.log({ features });
  collection.extend(features);
  console.log(source.getFeatures());
};
