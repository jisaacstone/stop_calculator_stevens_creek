import {describe, expect, test} from '@jest/globals';
import { closestPoint, loadLayer } from '../src/roads';
import testGeoJson from './data/sc-geojson_test';

describe("closest point", () => {
  test("it works", async () => {
    await loadLayer(async () => testGeoJson);
    const testPoint = [
      (-122.0874014 + -122.0872979)/2,
      (37.3861189 + 37.3861776)/2
    ];
    const { feature, point } = await closestPoint(testPoint);
    expect(feature.get('id')).toBe("3e7acab-bec0170");
    expect(point[0]).toBeCloseTo(testPoint[0], 2);
  });
});
