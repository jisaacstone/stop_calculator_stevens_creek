// OpenLayers Core Imports
import { default as OlMap } from 'ol/Map.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';

// Geometry Imports
import { MultiPoint, LineString, Point } from 'ol/geom.js';

// Format Imports
import { GeoJSON } from 'ol/format.js';

// Interaction Imports
import { default as Select } from 'ol/interaction/Select.js';
import { click } from 'ol/events/condition.js';

// Feature and Style Imports
import Feature from 'ol/Feature.js';
import { Text } from 'ol/style.js';
import { StyleFunction } from 'ol/style/Style.js';

// Asset Imports
import busStopSource from 'assets/busstops-geojson.json';
import { alternatives as stopTimings } from 'stopTimings.ts';

// Local Module Imports
import * as style from 'style';
import * as isochrone from 'isochrone';
import * as walkShed from 'walkShed';

const SECONDS_PER_MINUTE = 60;
const ISOCHRONE_TIME_SECONDS = 10 * SECONDS_PER_MINUTE;  // 300 metres was set before
const GeoJsonFormat = new GeoJSON<Feature<Point>>();
const nextBusCollection = new Set<string>();
const source = new VectorSource({
    format: GeoJsonFormat,
    features: GeoJsonFormat.readFeatures(
      busStopSource
    )
  });

export const layer = new VectorLayer({
  source: source,
  style: (f, res) => {
    let stl;
    if (nextBusCollection.has(f.getId() as string)) {
      stl = style.selected(15, res);
    } else {
      stl = style.circle(15, res);
    }
    if (res < .00001) {
      stl.setText(new Text({text: f.get('name'), font: '12px Calibri,sans-serif'}));
    }
    return stl;
  }
});

const selected: StyleFunction = ((f: Feature, r: number) => {
  const ss = style.selected(15, r);
  ss.setText(new Text({text: f.get('name'), font: '12px Calibri,sans-serif'}));
  return ss;
}) as StyleFunction;

const busSelect = new Select({
  condition: click,
  layers: [ layer ],
  style: selected
});

const getNextStop = (stopId: string, stopType: 'next' | 'cross', busType: keyof typeof stopTimings = "early") => {
  const timingEntry = stopTimings[busType].get(stopId);
  console.log("getNextStop ", timingEntry);
  if (timingEntry === undefined || timingEntry[stopType] === undefined) {  
    console.warn(`No next stop found for stop ID ${stopId}`);
    return undefined;
  }
  return timingEntry[stopType];
};

const processSelectedStop = (selected: Feature<Point>) => {
  const visitedStops = new Set<string>();
  const queue: { stop: string; remainingTime: number }[] = [
    { stop: selected.getId(), remainingTime: ISOCHRONE_TIME_SECONDS }
  ];
  const wsSegments = new Set<[[number, number], [number, number]]>();

  while (queue.length > 0) {
    const { stop, remainingTime } = queue.shift()!;
    console.log(`Processing stop ${stop} with remaining time ${remainingTime} queue.length: ${queue.length}`);

    if (visitedStops.has(stop)) continue;
    visitedStops.add(stop);

    const geometry = source.getFeatureById(stop)?.getGeometry();
    if (geometry) {
      const walkshed = isochrone.calcIsochrone(
        geometry.getFirstCoordinate(),
        remainingTime
      );
      walkshed.forEach((segment) => wsSegments.add(segment));
    }

    // Add accessible stops to the queue if there’s enough remaining time
    const crossStop = getNextStop(stop, 'cross');
    if (crossStop) {
      nextBusCollection.add(crossStop.id);
      const travelTime = crossStop.cost * SECONDS_PER_MINUTE; // Cost in seconds
      if (remainingTime >= travelTime) {
        queue.push({ stop: crossStop.id, remainingTime: remainingTime - travelTime });
      }
    }
    const nextStop = getNextStop(stop, 'next');
    if (nextStop) {
      nextBusCollection.add(nextStop.id);
      const travelTime = nextStop.cost * SECONDS_PER_MINUTE; // Cost in seconds
      if (remainingTime >= travelTime) {
        queue.push({ stop: nextStop?.id, remainingTime: remainingTime - travelTime });
      }
    }
  }
  walkShed.setWalkShed(Array.from(wsSegments), 'walkshed');
};

export const addSelectEvent = (map: OlMap) => {
  map.addInteraction(busSelect);
  busSelect.on(["select"], (event) => {
    nextBusCollection.clear();
    if (!event.selected || event.selected.length === 0) {
      return;
    }
    const selected = event.selected[0] as Feature<Point>;
    processSelectedStop(selected);
    /*
    // TODO delete
    console.log(selected);
    const geometry = selected.getGeometry();
    if (geometry) {
      const walkshed = isochrone.calcIsochrone(geometry.getFirstCoordinate(), ISOCHRONE_TIME_SECONDS);
      walkShed.setWalkShed(Array.from(walkshed), 'walkshed');
    }

    // Get next bus stop from stopTimings
    const nextStopId = getNextStop(selected.getId() as string);
    if (nextStopId !== undefined) {
      nextBusCollection.add(nextStopId);
    }
    */
  });
}