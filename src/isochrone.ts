import nodes from 'assets/nld.json';
import { PriorityQueue } from '@datastructures-js/priority-queue';

type Link = { id: string, osmid: number, source: number, target: number, length: number };
type Entry = { nodeId: number, remaining: number };

//document.nodes = nodes;

// Precomputed adjacency list for fast lookups
const linkMap = new Map<number, Link[]>();
nodes.links.forEach((link: Link) => {
  if (!linkMap.has(link.source)) {
    linkMap.set(link.source, []);
  }
  linkMap.get(link.source)!.push(link);
});

//const findEdges = (start: number, seen: Set<string>): link[] => {
//  return nodes.links
//    .filter((link: link) => link.s === start && !seen.has(link.id));
//}

const traverse = (start: number, distance: number) => {
  const seen: Set<string> = new Set();
  const queue: PriorityQueue<Entry> = new PriorityQueue(
    (ea, eb) => eb.remaining - ea.remaining
  );
  const found: Set<string> = new Set();
  const incomplete: Set<string> = new Set();

  queue.enqueue({ nodeId: start, remaining: distance });
  seen.add(start.toString());
  let nextEntry: Entry | null;

  while (nextEntry = queue.dequeue()) {
    console.log(nextEntry);

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

export const neighbors = (id: string): Link[] => {
  const edge = nodes.links.find((l: Link) => l.id === id);
  if (!edge) {
    return [];
  }
  return linkMap.get(edge.source)?.concat(linkMap.get(edge.target) || []) || [];
};

