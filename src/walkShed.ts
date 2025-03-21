import {LineString, Polygon} from 'ol/geom.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Coordinate} from 'ol/coordinate.js';
import {GeoJSON} from 'ol/format.js';
import Collection from 'ol/Collection.js';
import Feature from 'ol/Feature.js';
import * as turf from '@turf/turf';

import * as style from 'style';

const GeoJsonFormat = new GeoJSON();
const polyCollection: Collection<Feature<Polygon>> = new Collection();
const polySource = new VectorSource<Feature<Polygon>>({wrapX: false, features: polyCollection});

export const polyLayer = new VectorLayer({
  source: polySource,
  style: style.walkArea,
});

const lineCollection: Collection<Feature<LineString>> = new Collection();
const lineSource = new VectorSource<Feature<LineString>>({wrapX: false, features: lineCollection});

export const walkShedLayer = new VectorLayer({
  source: lineSource,
  style: (_, resolution) => {
    return style.gridRoad(5, resolution);
  },
});

export const clear = () => {
  lineCollection.clear();
};

export const setWalkShed = (lines: Coordinate[][], category: string = "walk") => {
  const features = lines.map(l => new Feature<LineString>(
    {
      geometry: new LineString(l),
      category,
      projection: 'EPSG:4326',
    }
  ));
  lineCollection.extend(features);
  const poly = turf.convex(turf.featureCollection(lines.map(l => turf.lineString(l))));
  if (poly) {
    const olPoly = GeoJsonFormat.readFeature(poly) as Feature<Polygon>;
    polyCollection.push(olPoly);
  }
};
