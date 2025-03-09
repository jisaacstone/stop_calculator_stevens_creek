import {describe, expect, test} from '@jest/globals';
import { closestPoint, scRoadGraph } from '../src/roads'; // Adjust the import path
import Feature from 'ol/Feature.js';
import {LineString} from 'ol/geom.js';
import {GeoJSON} from 'ol/format.js';
import testGeoJson from './data/sc-geojson_test';


const testFeatures = new GeoJSON<Feature<LineString>>().readFeatures(
  testGeoJson,
  {featureProjection: 'EPSG:4326'}
);
scRoadGraph.getSource()?.clear();
scRoadGraph.getSource()?.addFeatures(testFeatures);

describe("closest point", () => {
  test("it works", () => {
    const testPoint = [
      (-122.0874014 + -122.0872979)/2,
      (37.3861189 + 37.3861776)/2
    ];
    const { feature, point } = closestPoint(testPoint);
    expect(feature.get('id')).toBe("3e7acab-bec0188");
    expect(point[0]).toBeCloseTo(testPoint[0], 2);
  });
});
