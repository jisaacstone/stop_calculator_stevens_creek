import nodes from 'assets/nld.json';
import { PriorityQueue } from '@datastructures-js/priority-queue';

type link = { id: string, osmid: number, s: number, t: number, l: number };
type entry = { nodeId: number, remaining: number };

document.nodes = nodes;

const findEdges = (start: number, seen: Set<string>): link[] => {
  return nodes.links
    .filter((link: link) => link.s === start && !seen.has(link.id));
}

const traverse = (start: number, distance: number, found: Set<number>) => {
  let stopafter = 1000;
  const seen: Set<string> = new Set();
  const queue: PriorityQueue<entry> = new PriorityQueue(
    (ea, eb) => eb.remaining - ea.remaining
  );
  queue.enqueue({ nodeId: start, remaining: distance });
  while (stopafter > 0) {
    const nextEntry = queue.dequeue();
    console.log(nextEntry, stopafter);
    if (nextEntry === null) {
      return;
    }
    findEdges(nextEntry.nodeId, seen).forEach(({ id, osmid, t, l }) => {
      console.log('edge', t, osmid, l);
      if (l < nextEntry.remaining) {
        found.add(osmid);
        queue.enqueue({nodeId: t, remaining: nextEntry.remaining - l});
      }
      seen.add(id);
    });
    stopafter--;
  }
};

export const calcIsochrone = (start: number, distance: number) => {
  const found: Set<number> = new Set();
  traverse(start, distance, found);
  return found;
};

export const neighbors = (osmid: number): link[] => {
  return (
    nodes.links
    .filter((l: link) => l.osmid === osmid)
    .reduce((found: link[], link: link) => {
      return found.concat(nodes.links.filter((l: link) => l.s === link.t || l.t === link.s));
    }, [])
  );
};
