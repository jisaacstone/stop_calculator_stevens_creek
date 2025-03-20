import {LineString} from 'ol/geom.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Coordinate} from 'ol/coordinate.js';
import Collection from 'ol/Collection.js';
import Feature from 'ol/Feature.js';

import * as style from 'style';


const collection: Collection<Feature<LineString>> = new Collection();
const source = new VectorSource<Feature<LineString>>({wrapX: false, features: collection});

export const walkShedLayer = new VectorLayer({
  source: source,
  style: (_, resolution) => {
    return style.gridRoad(5, resolution);
  },
});

export const clear = () => collection.clear();

export const setWalkShed = (lines: Coordinate[][], category: string = "walk") => {
  const features = lines.map(l => new Feature<LineString>(
    {
      geometry: new LineString(l),
      category,
      projection: 'EPSG:4326',
    }
  ));
  collection.extend(features);
};
