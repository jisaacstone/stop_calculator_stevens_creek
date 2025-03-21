import { PriorityQueue } from '@datastructures-js/priority-queue';
import { GeoJSON } from 'ol/format.js';

import nld from './assets/nld.ts';
import { Coordinate } from 'ol/coordinate';
import { closestPoint } from 'roads';
import * as turf from '@turf/turf';
import { WALKING_SPEED_MS } from 'constants.ts';


type Segment = [number, number][];
type Link = { id: string, source: number, target: number, length_m: number, coords: Segment };
type Entry = { nodeId: number, remaining: number };

const geoJsonFormat = new GeoJSON();

// Precomputed adjacency list for fast lookups
export const linkMap = new Map<number, Link[]>();
export function loadNLD() {
  nld.links.forEach((link: Link) => {
    if (!linkMap.has(link.source)) {
      linkMap.set(link.source, []);
    }
    linkMap.get(link.source)!.push(link);
    if (!linkMap.has(link.target)) {
      linkMap.set(link.target, []);
    }
    linkMap.get(link.target)!.push(link);
  });
};

const traverse = (start: number, time: number) => {
  const seen: Set<string> = new Set();
  const queue: PriorityQueue<Entry> = new PriorityQueue(
    (ea, eb) => eb.remaining - ea.remaining
  );
  const found: Segment[] = [];

  queue.enqueue({ nodeId: start, remaining: time });
  let nextEntry: Entry | null;

  while ((nextEntry = queue.dequeue()) !== null ) {
    const edges = linkMap.get(nextEntry.nodeId);
    if (nextEntry.remaining <= 0) {
      continue;
    }
    if (!edges) {
      console.log(nextEntry.nodeId, 'not in linkMap');
      continue;
    }
    for (const {id, source, target, length_m, coords} of edges) {
      if (seen.has(id)) {
        continue;
      }
      const line = turf.lineString(coords);
      if (!turf.booleanValid(line)) {
        console.log('invalid!', id, line);
      }
      if (length_m / WALKING_SPEED_MS <= nextEntry.remaining) {
        //full segment
        found.push(coords);
        const endNode = (source == nextEntry.nodeId) ? target : source;
        queue.enqueue({ nodeId: endNode, remaining: nextEntry.remaining - length_m / WALKING_SPEED_MS });
      }
      else {
        const partial = pointAlong(coords, getCoords(nextEntry.nodeId), nextEntry.remaining);
        found.push(partial);
      }
      seen.add(id);
    }
  }
  return found;
};

const closeTo = (p1: [number, number], p2: [number, number]):boolean => {
  return (Math.abs(p1[0] - p2[0])) < 0.000001 && (Math.abs(p1[0] - p2[0])) < 0.000001;
}

const pointAlong = (coords: Segment, start: [number, number], distance: number) => {
  if(!closeTo(coords[0], start)) {
    coords.reverse();
  }
  const line = turf.lineString(coords);
  const segment = turf.lineSliceAlong(line, 0, distance, { units: 'meters' });
  return turf.getCoords(segment);
}

export const addPseudoNode = (coords: Coordinate) => {
  // add an pseudo node if the start is of type Coordinate
  const pseudoNodeId = -nld.nodes.length;
  // @ts-expect-error type error
  nld.nodes.push({ id: pseudoNodeId, x: coords[0], y: coords[1] });

  const { feature, point } = closestPoint(coords);
  const turfPoint = turf.point(point);

  const link = nld.links.find((l: Link) => l.id === feature.get('id'));
  if (!link) {
    throw 'Link not found';
  }
  const coordmap = new Map<string, number>([
    ['' + getCoords(link.source), link.source],
    ['' + getCoords(link.target), link.target]
  ]);

  const turfLine = geoJsonFormat.writeFeatureObject(feature);

  const split = turf.lineSplit(turfLine, turfPoint);
  const pseudoLinks = split.features.map(turfFeature => {
    const length = turf.length(turfFeature, {units: 'meters'});
    const coords = turf.getCoords(turfFeature);
    let nodeId: number;
    if (coordmap.has('' + coords[0])) {
      nodeId = coordmap.get('' + coords[0])!;
    } else {
      nodeId = coordmap.get('' + coords[coords.length - 1])!;
    }
    return {
      id: `pn_${pseudoNodeId}_${nodeId}`,
      source: pseudoNodeId,
      target: nodeId,
      length_m: length,
      coords
    };
  });
  linkMap.set(pseudoNodeId, pseudoLinks);
  return pseudoNodeId;
};

export const calcIsochrone = (start: Coordinate, time: number) => {
  const startId = addPseudoNode(start);
  return traverse(startId, time);
};

const getCoords = (nodeId: number, fraction: number = 1, x: number = 0, y: number = 0): [number, number] => {
  const n = nld.nodes.find(node => node.id === nodeId);

  if (!n) throw new Error(`Node with ID ${nodeId} not found`);

  return [x + fraction * (n.x - x), y + fraction * (n.y - y)]
};
