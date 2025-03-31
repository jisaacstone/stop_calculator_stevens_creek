import {LineString, Polygon} from 'ol/geom.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import {Coordinate} from 'ol/coordinate.js';
import {GeoJSON} from 'ol/format.js';
import Collection from 'ol/Collection.js';
import Feature from 'ol/Feature.js';
import * as GJ from 'geojson';
import * as turf from '@turf/turf';

import * as style from 'style';

const GeoJsonFormat = new GeoJSON();
const polyCollection: Collection<Feature<Polygon>> = new Collection();
const polySource = new VectorSource<Feature<Polygon>>({wrapX: false, features: polyCollection});

export const polyLayer = new VectorLayer({
  source: polySource,
  style: (feature) => {
    if (feature.get('category') === 'brt') {
      return style.BRTArea;
    }
    return style.walkArea;
  }
});

const lineCollection: Collection<Feature<LineString>> = new Collection();
const lineSource = new VectorSource<Feature<LineString>>({wrapX: false, features: lineCollection});

export const walkShedLayer = new VectorLayer({
  source: lineSource,
  style: (feature, resolution) => {
    if (feature.get('category') === 'brt') {
      return style.brtPath(3, resolution);
    }
    return style.walkPath(5, resolution);
  },
});

export const clear = () => {
  lineCollection.clear();
  polyCollection.clear();
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
  const poly = turf.concave(
    turf.featureCollection(
      lines.flat().map(l => turf.point(l))
    ),
    {maxEdge: 333, units: 'meters'}
  );
  // remove holes, if any
  if (poly) {
    return turf.polygon([poly.geometry.coordinates[0] as Coordinate[]]);
  }
  return null;
}

export const setCatchement = (polys: { bus: GJ.Feature<GJ.Polygon, GJ.GeoJsonProperties>[], brt: GJ.Feature<GJ.Polygon, GJ.GeoJsonProperties>[]}) => {
  const areas: {[key: string]: number} = {bus: 0, brt: 0};
  for (const [key, polygons] of Object.entries(polys)) {
    const combined = turf.dissolve(
      turf.featureCollection(polygons)
    );

    combined.features.forEach((turfPoly) => {
      const area = turf.area(turfPoly);
      const olPoly = GeoJsonFormat.readFeature(turfPoly) as Feature<Polygon>;
      olPoly.set('area', area);
      olPoly.set('category', key);
      polyCollection.push(olPoly);
      areas[key] += area;
    });
  };
  return areas;
};
