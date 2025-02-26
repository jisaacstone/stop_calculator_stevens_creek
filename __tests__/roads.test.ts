import {fromLonLat} from 'ol/proj';
import {describe, expect, test} from '@jest/globals';
import { closestPoint } from '../src/roads'; // Adjust the import path

describe("closest point", () => {
  test("it works", () => {
    const testPoint = fromLonLat([-121.9527033, 37.3240887]);
    const { feature, point } = closestPoint(testPoint);
    expect(feature.get('id')).toBe("2ebbd7899-2ebbd789b");
    expect(point[0]).toBeCloseTo(-121.9527035, 2);
  });
});
