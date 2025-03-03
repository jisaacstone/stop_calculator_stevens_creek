import nld from './assets/nld.ts';
import { PriorityQueue } from '@datastructures-js/priority-queue';

type Link = { id: string, osmid: number, source: number, target: number, length: number };
type Node = { id: string, x: number, y: number };
type NLD = { nodes: Node[], links: Link[] };

export type Segment = [[number, number], [number, number]]; 
type Entry = { nodeId: number, remaining: number };

// Precomputed adjacency list for fast lookups
const _linkMap = new Map<number, Link[]>();
nld.links.forEach((link: Link) => {
  if (!_linkMap.has(link.source)) {
    _linkMap.set(link.source, []);
  }
  _linkMap.get(link.source)!.push(link);
});

const traverse = (start: number, distance: number, linkMap?: Map<number, Link[]>, _nld?: NLD ) => {
  linkMap = linkMap || _linkMap;
  _nld = _nld || nld;

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
        found.add([getCoords(source, _nld), getCoords(target, _nld)]);
        queue.enqueue({ nodeId: target, remaining: nextEntry.remaining - length });
      }
      else {
        //incomplete segment
        const frac = nextEntry.remaining / length;
        const segment_start: [number, number] = getCoords(source, _nld);
        const segment_end: [number, number] = getCoords(target, _nld, frac, segment_start[0], segment_start[1]);
        found.add([segment_start, segment_end])
      }
      seen.add(id);
    }
  }
  return found;
};

export const calcIsochrone = (start: number, distance: number, _nld?: NLD) => {

  // the following if statement is added for testing but the design is not optimal 
  // TODO move linkMap calculation to the osmnx_dl.py for both actual and test data
  if (_nld) {
    const _linkMap = new Map<number, Link[]>();
    _nld.links.forEach((link: Link) => {
      if (!_linkMap.has(link.source)) {
        _linkMap.set(link.source, []);
      }
      _linkMap.get(link.source)!.push(link
      );
    });
    return traverse(start, distance, _linkMap, _nld);
  } 

  return traverse(start, distance);
};

const getCoords = (nodeId: number, _nld: NLD, fraction: number = 1, x: number = 0, y: number = 0): [number, number] => {
  const n = _nld.nodes.find(node => node.id === nodeId);

  if (!n) throw new Error(`Node with ID ${nodeId} not found`);

  return [x + fraction * (n.x - x), y + fraction * (n.y - y)]
};

export const neighbors = (edgeId: string, _nld?: NLD): Segment[] => {
  _nld = _nld || nld;
  const selected: Link | undefined = _nld.links.find((l: Link) => l.id === edgeId);
  
  if (!selected) {
    return [];
  }

  return (
    _nld.links
    .filter((l: Link) => l.source === selected.target || l.target === selected.source)
    .map((l: Link) => [getCoords(l.source, _nld), getCoords(l.target, _nld)])
  );
};