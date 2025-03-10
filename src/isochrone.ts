import { PriorityQueue } from '@datastructures-js/priority-queue';

import nld from './assets/nld.ts';
/* TODO
// Lazy loading in case the file is too big
async function fetchNLD() {
  const response = await import('./assets/nld.ts');
  return response.nld;
}
const nld = fetchNLD();
*/

type Link = { id: string, osmid: number, source: number, target: number, length: number };

type Segment = [[number, number], [number, number]];
type Entry = { nodeId: number, remaining: number };

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


const traverse = (start: number, distance: number) => {
  const seen: Set<string> = new Set();
  const queue: PriorityQueue<Entry> = new PriorityQueue(
    (ea, eb) => eb.remaining - ea.remaining
  );
  const found: Set<Segment> = new Set();

  queue.enqueue({ nodeId: start, remaining: distance });
  let nextEntry: Entry | null;

  while ((nextEntry = queue.dequeue()) !== null ) {
    const edges = linkMap.get(nextEntry.nodeId) || [];
    for (const {id, source, target, length} of edges) {
      if (seen.has(id)) {
        continue;
      }

      if (length <= nextEntry.remaining) {
        //full segment
        found.add([getCoords(source), getCoords(target)]);
        queue.enqueue({ nodeId: target, remaining: nextEntry.remaining - length });
      }
      else {
        //incomplete segment
        const frac = nextEntry.remaining / length;
        const segment_start: [number, number] = getCoords(source);
        const segment_end: [number, number] = getCoords(target, frac, segment_start[0], segment_start[1]);
        found.add([segment_start, segment_end])
      }
      seen.add(id);
    }
  }
  return found;
};

export const calcIsochrone = (start: number, distance: number) => {
  return traverse(start, distance);
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
