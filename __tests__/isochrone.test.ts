import Feature from 'ol/Feature.js';
import {LineString} from 'ol/geom.js';
import {GeoJSON} from 'ol/format.js';
import {describe, expect, test} from '@jest/globals';

import testGeoJson from './data/sc-geojson_test';
import { default as testData } from './data/nld_test';
import { default as nld } from '../src/assets/nld';
import { calcIsochrone, loadNLD } from '../src/isochrone';
import { getLayer } from '../src/roads';
import { WALKING_SPEED_MS } from '../src/constants';

// Hack for jest.mock, which didn't work somehow
nld.nodes = testData.nodes;
nld.links = testData.links;
const testFeatures = new GeoJSON<Feature<LineString>>().readFeatures(
  testGeoJson,
  {featureProjection: 'EPSG:4326'}
);
const { source } = getLayer();
source.clear();
source.addFeatures(testFeatures);

test('should fetch mocked nld', () => {
  expect(nld.nodes.length).toBe(4); // Should now use test data
});

describe("calcIsochrone function", () => {
  test("should return full and partial line segments list", () => {
    loadNLD();
    const result = calcIsochrone(
      [-122.0874014, 37.3861189],
      12 / (WALKING_SPEED_MS)
    );
    const precision = 5; //  TODO how much precision is needed?

    const resultArray = Array.from(result);
    console.log(resultArray);
    expect(resultArray).toContainEqual([
      [ expect.closeTo(-122.0872979, precision), expect.closeTo(37.3861776, precision) ],
      [ expect.closeTo(-122.0874014, precision), expect.closeTo(37.3861189, precision) ]
    ]);
    expect(resultArray).toContainEqual([
      [expect.closeTo(-122.0872979, precision), expect.closeTo(37.3861776, precision)],
      [expect.closeTo(-122.08729077741405, precision), expect.closeTo(37.38618151350876, precision)]
    ]);
/*
point1 = [-122.0874014, 37.3861189]
console.log
      [
        [ [ -122.0871511, 37.385643 ], [ -122.0872979, 37.3861776 ] ],
        [ [ -122.0871511, 37.385643 ], [ -122.0871511, 37.385643 ] ],
        [
          [ -122.0871511, 37.385643 ],
          [ -122.08715155030566, 37.38564430417106 ]
        ],
        [
          [ -122.0872979, 37.3861776 ],
          [ -122.0872969259668, 37.386178135183584 ]
        ],
        [
          [ -122.0872979, 37.3861776 ],
          [ -122.08729731125983, 37.386176783568814 ]
        ]
      ]
*/
/*
[[[-122.0874014, 37.3861189], [-122.0872979, 37.3861776]],
 [[-122.0874014, 37.3861189], [-122.08733940049618, 37.38602288128789]],
 [[-122.0872979, 37.3861776], [-122.08729077741405, 37.38618151350876]],
 [[-122.0872979, 37.3861776], [-122.08729359486672, 37.38617162987453]]]
*/
  });
});
