import { PriorityQueue } from '@datastructures-js/priority-queue';

import nld from './assets/nld.ts';
import { Coordinate } from 'ol/coordinate';
import { closestPoint } from 'roads';
import * as turf from '@turf/turf';
/* TODO
// Lazy loading in case the file is too big
async function fetchNLD() {
  const response = await import('./assets/nld.ts');
  return response.nld;
}
const nld = fetchNLD();
*/

type Link = { id: string, source: number, target: number, length: number };

type Segment = [[number, number], [number, number]];
type Entry = { nodeId: number, remaining: number };

export const WALKING_SPEED_MS = 1.33; // (m/s) = 5.8 km/h 

// Precomputed adjacency list for fast lookups
const linkMap = new Map<number, Link[]>();
export function loadNLD() {
  nld.links.forEach((link: Link) => {
    if (!linkMap.has(link.source)) {
      linkMap.set(link.source, []);
    }
    linkMap.get(link.source)!.push(link);
  });
};

const traverse = (start: number, time: number) => {
  const seen: Set<string> = new Set();
  const queue: PriorityQueue<Entry> = new PriorityQueue(
    (ea, eb) => eb.remaining - ea.remaining
  );
  const found: Set<Segment> = new Set();

  queue.enqueue({ nodeId: start, remaining: time });
  let nextEntry: Entry | null;

  while ((nextEntry = queue.dequeue()) !== null ) {
    const edges = linkMap.get(nextEntry.nodeId) || [];
    for (const {id, source, target, length} of edges) {
      if (seen.has(id)) {
        continue;
      }

      if (length / WALKING_SPEED_MS <= nextEntry.remaining) {
        //full segment
        found.add([getCoords(source), getCoords(target)]);
        queue.enqueue({ nodeId: target, remaining: nextEntry.remaining - length / WALKING_SPEED_MS });
      }
      else {
        //incomplete segment
        const frac = nextEntry.remaining * WALKING_SPEED_MS / length;
        const segment_start: [number, number] = getCoords(source);
        const segment_end: [number, number] = getCoords(target, frac, segment_start[0], segment_start[1]);
        found.add([segment_start, segment_end])
      }
      seen.add(id);
    }
  }
  return found;
};

export const addPseudoNode = (coords: Coordinate) => {
  // add an pseudo node if the start is of type Coordinate
  const pseudoNode = nld.nodes.length;
  // @ts-expect-error type error
  nld.nodes.push({ id: pseudoNode, x: coords[0], y: coords[1] });

  const { feature, point } = closestPoint(coords);

  const link = nld.links.find((l: Link) => l.id === feature.get('id'));
  if (!link) {
    throw 'Link not found';
  }
  const lengths = turf.distance(turf.point(point), turf.point(getCoords(link.source)));
  const lengtht = turf.distance(turf.point(getCoords(link.target)), turf.point(point));
  const pseudoLinks = [
    {
      id: `pseudo_${pseudoNode}_${link.source}`,
      source: pseudoNode,
      target: link.source,
      length: lengths
    },
    {
      id: `pseudo_${pseudoNode}_${link.target}`,
      source: pseudoNode,
      target: link.target,
      length: lengtht
    },
  ];

  linkMap.set(pseudoNode, pseudoLinks);
  return pseudoNode;
};

export const calcIsochrone = (start: number | Coordinate, time: number) => {
  if (Array.isArray(start)) {
    start = addPseudoNode(start);
  }
  return traverse(start, time);
};

const getCoords = (nodeId: number, fraction: number = 1, x: number = 0, y: number = 0): [number, number] => {
  const n = nld.nodes.find(node => node.id === nodeId);

  if (!n) throw new Error(`Node with ID ${nodeId} not found`);

  return [x + fraction * (n.x - x), y + fraction * (n.y - y)]
};

export const neighbors = (edgeId: string): Segment[] => {
  const selected: Link | undefined = nld.links.find((l: Link) => l.id === edgeId);

  if (!selected) {
    return [];
  }

  return (
    nld.links
    .filter((l: Link) => l.source === selected.target || l.target === selected.source)
    .map((l: Link) => [getCoords(l.source), getCoords(l.target)])
  );
};
