import nld from './assets/nld.ts';
import { PriorityQueue } from '@datastructures-js/priority-queue';

const nodes = nld;
export type Link = { id: string, osmid: number, source: number, target: number, length: number };
type Entry = { nodeId: number, remaining: number };

// Precomputed adjacency list for fast lookups
const _linkMap = new Map<number, Link[]>();
nodes.links.forEach((link: Link) => {
  if (!_linkMap.has(link.source)) {
    _linkMap.set(link.source, []);
  }
  _linkMap.get(link.source)!.push(link);
});

export const traverse = (start: number, distance: number, linkMap?: Map<number, Link[]> ) => {
  linkMap = linkMap || _linkMap;
  const seen: Set<string> = new Set();
  const queue: PriorityQueue<Entry> = new PriorityQueue(
    (ea, eb) => eb.remaining - ea.remaining
  );
  const found: Set<string> = new Set();
  const incomplete: Set<string> = new Set();

  queue.enqueue({ nodeId: start, remaining: distance });
  let nextEntry: Entry | null;

  while (nextEntry = queue.dequeue()) {
    const edges = linkMap.get(nextEntry.nodeId) || [];
    for (const {id, target, length} of edges) {
      if (seen.has(id)) {
        continue;
      }

      if (length <= nextEntry.remaining) {
        found.add(id);
        queue.enqueue({ nodeId: target, remaining: nextEntry.remaining - length });
      }
      else {
        incomplete.add(id);
      }
      seen.add(id);
    }
  }
  return { found, incomplete };
};

export const calcIsochrone = (start: number, distance: number) => {
  return traverse(start, distance);
};

const getCoords = (nodeId: number): [number, number] => {
  const n = nodes.nodes.filter(node => node.id === nodeId)[0];
  return [n.x, n.y];
};

export const neighbors = (id: string): [[number, number], [number, number]][] => {
  const selected: Link = nodes.links.filter((l: Link) => l.id === id)[0];
  return (
    nodes.links
    .filter((l: Link) => l.source === selected.target || l.target === selected.source)
    .map((l: Link) => [getCoords(l.source), getCoords(l.target)])
  );
};