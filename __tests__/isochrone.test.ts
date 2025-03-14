import {describe, expect, test} from '@jest/globals';
import * as turf from '@turf/turf';

import { default as testData } from './data/nld_test';
import { default as nld } from '../src/assets/nld';
import { neighbors, calcIsochrone, loadNLD, WALKING_SPEED_MS } from '../src/isochrone';

// Hack for jest.mock, which didn't work somehow
nld.nodes = testData.nodes;
nld.links = testData.links;

test('should fetch mocked nld', () => {
  expect(nld.nodes.length).toBe(6); // Should now use test data
});

describe("neigbour function", () => {
  test("should return correct coords", () => {
    const result = neighbors("bec017c-bec0188");
    expect(result).toContainEqual([[-122.0872979, 37.3861776], [-122.0874014, 37.3861189]]);
    expect(result).toContainEqual([[-122.0872166, 37.3858327], [-122.0871511, 37.385643]]);
  });
});

describe("calcIsochrone function", () => {
  test("should return full and partial line segments list", () => {
    loadNLD();
    const result = calcIsochrone(200016264, 12 / WALKING_SPEED_MS);
    const precision = 10;

    expect(result.size).toBe(4);
    const resultArray = Array.from(result);
    const distanceArray = resultArray.map(([c1, c2]) => turf.distance(turf.point(c1), turf.point(c2), {units: 'meters'}));
    expect (distanceArray).toContainEqual(expect.closeTo(12, precision / 2));
    //console.log(distanceArray)
    expect(resultArray).toContainEqual([
      [ expect.closeTo(-122.0874014, precision), expect.closeTo(37.3861189, precision) ],
      [ expect.closeTo(-122.0872979, precision), expect.closeTo(37.3861776, precision) ]
    ]);
    expect(resultArray).toContainEqual([
      [expect.closeTo(-122.0872979, precision), expect.closeTo(37.3861776, precision)], 
      [expect.closeTo(-122.08729077741405, precision), expect.closeTo(37.38618151350876, precision)]
    ]);
/*
[[[-122.0874014, 37.3861189], [-122.0872979, 37.3861776]], 
 [[-122.0874014, 37.3861189], [-122.08733940049618, 37.38602288128789]], 
 [[-122.0872979, 37.3861776], [-122.08729077741405, 37.38618151350876]], 
 [[-122.0872979, 37.3861776], [-122.08729359486672, 37.38617162987453]]]
*/
  });
});

