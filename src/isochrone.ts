import nodes from 'assets/nld.json';
import { PriorityQueue } from '@datastructures-js/priority-queue';

type link = { id: string, osmid: number, s: number, t: number, l: number };
type entry = { nodeId: number, remaining: number };

document.nodes = nodes;

const findEdges = (start: number, seen: Set<string>): link[] => {
  return nodes.links
    .filter((link: link) => link.s === start && !seen.has(link.id));
}

const traverse = (start: number, distance: number, found: Set<string>) => {
  let stopafter = 1000;
  const seen: Set<string> = new Set();
  const queue: PriorityQueue<entry> = new PriorityQueue(
    (ea, eb) => eb.remaining - ea.remaining
  );
  const incomplete: Set<string> = new Set();
  queue.enqueue({ nodeId: start, remaining: distance });
  while (stopafter > 0) {
    const nextEntry = queue.dequeue();
    console.log(nextEntry, stopafter);
    if (nextEntry === null) {
      return incomplete;
    }
    findEdges(nextEntry.nodeId, seen).forEach(({ id, t, l }) => {
      console.log('edge', t, l);
      if (l < nextEntry.remaining) {
        found.add(id);
        queue.enqueue({nodeId: t, remaining: nextEntry.remaining - l});
      } else {
        incomplete.add(id);
      }
      seen.add(id);
    });
    stopafter--;
  }
  return incomplete;
};

export const calcIsochrone = (start: number, distance: number) => {
  const found: Set<string> = new Set();
  const incomplete = traverse(start, distance, found);
  return { found, incomplete };
};

export const neighbors = (id: string): link[] => {
  return (
    nodes.links
    .filter((l: link) => l.id === id)
    .reduce((found: link[], link: link) => {
      return found.concat(nodes.links.filter((l: link) => l.s === link.t || l.t === link.s));
    }, [])
  );
};
