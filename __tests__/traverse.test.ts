import {describe, expect, test} from '@jest/globals';
import { traverse, Link } from '../src/isochrone'; // Adjust the import path

// Mock nodes data
const mockNodes = new Map<number, Link[]>([
    [1, [{ id: "1", osmid: 1001, source: 1, target: 2, length: 5 }, { id: "4", osmid: 1004, source: 1, target: 3, length: 8 }]],
    [2, [{ id: "2", osmid: 1002, source: 2, target: 3, length: 10 }]],
    [3, [{ id: "3", osmid: 1003, source: 3, target: 4, length: 15 }]]
  ]);

describe("traverse function", () => {
  test("should return correct found and incomplete sets", () => {
    const result = traverse(1, 20, mockNodes);
    expect(result.found).toContain("1");
    expect(result.found).toContain("4");
    expect(result.incomplete).toContain("3"); // Edge 3 exceeds distance
  });

  test("should return empty sets for an isolated node", () => {
    const result = traverse(99, 10, mockNodes); // Node 99 doesn't exist in mock data
    expect(result.found.size).toBe(0);
    expect(result.incomplete.size).toBe(0);
  });
});