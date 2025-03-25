// OpenLayers
import { GeoJSON } from 'ol/format.js';
import Feature from 'ol/Feature.js';
import {LineString} from 'ol/geom.js';
import { Coordinate } from 'ol/coordinate';

// Other Libraries
import { PriorityQueue } from '@datastructures-js/priority-queue';
import * as turf from '@turf/turf';

// Local imports
import { closestPoint } from 'roads';
import { WALKING_SPEED_MS } from 'constants.ts';


type Segment = Coordinate[];
type Link = { id: string, source: number, target: number, length_m: number, coords: Segment };
type Entry = { nodeId: number, remaining: number };
type Node = { id: number, x: number, y: number};
type NLD = { links: Link[], nodes: Node[] }

const geoJsonFormat = new GeoJSON<Feature<LineString>>();

// Precomputed adjacency list for fast lookups
export const linkMap = new Map<number, Link[]>();
export const featureLinkMap = new Map<string, Link>();
export const nodeMap = new Map<number, [number, number]>();
export async function loadNLD(nld: NLD | null = null) {
  if (nld === null) {
    nld = (await import('./assets/nld.ts')).default;
  }
  nld.links.forEach((link: Link) => {
    if (!linkMap.has(link.source)) {
      linkMap.set(link.source, []);
    }
    linkMap.get(link.source)!.push(link);
    if (!linkMap.has(link.target)) {
      linkMap.set(link.target, []);
    }
    linkMap.get(link.target)!.push(link);
    featureLinkMap.set(link.id, link);
  });
  nld.nodes.forEach(node => {
    nodeMap.set(node.id, [node.x, node.y]);
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
      console.log(nextEntry, 'not in linkMap!');
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

const closeTo = (p1: Coordinate, p2: Coordinate):boolean => {
  return (Math.abs(p1[0] - p2[0])) < 0.000001 && (Math.abs(p1[0] - p2[0])) < 0.000001;
}

const pointAlong = (coords: Segment, start: Coordinate, distance: number) => {
  if(!closeTo(coords[0], start)) {
    coords.reverse();
  }
  const line = turf.lineString(coords);
  const segment = turf.lineSliceAlong(line, 0, distance, { units: 'meters' });
  return turf.getCoords(segment);
}

const addPseudoNode = async (coords: Coordinate) => {
  // add an pseudo node if the start is of type Coordinate
  const pseudoNodeId = coords[0] + coords[1];
  nodeMap.set(pseudoNodeId, coords as [number, number]);

  const { feature, point } = await closestPoint(coords);
  const turfPoint = turf.point(point);
  const link = featureLinkMap.get(feature.get('id'));
  if (!link) {
    console.log('link not found!', feature);
    return;
  }
  const src = link.source;
  const tgt = link.target;
  const coordmap = new Map<string, number>([
    ['' + getCoords(src), src],
    ['' + getCoords(tgt), tgt]
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

export const calcIsochrone = async (start: Coordinate, time: number) => {
  const startId = await addPseudoNode(start);
  if (startId) {
    return traverse(startId, time);
  }
};

const getCoords = (nodeId: number): Coordinate => {
  return nodeMap.get(nodeId) || [NaN, NaN];
};
