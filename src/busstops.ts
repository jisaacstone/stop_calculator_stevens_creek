// OpenLayers Core Imports
import { default as OlMap } from 'ol/Map.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';

// Geometry Imports
import { Point } from 'ol/geom.js';

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
import * as state from 'state';
import { SECONDS_PER_MINUTE, SQ_METER_IN_SQ_KM } from 'constants';

// Collect all stop IDs from stopTimings
const stopTimingIds = new Set([
  ...Array.from(stopTimings.early.keys()),
  ...Array.from(stopTimings.peak.keys())
]);

// Filter bus stops that have any matching ID in stopTimings
const filteredBusStops = busStopSource.features.filter((feature) => {
  const featureStopId = feature.id;
  return stopTimingIds.has(featureStopId);
});

// Create a new GeoJSON object with the filtered features
const reducedBusStopSource = {
  ...busStopSource,
  features: filteredBusStops
};

const GeoJsonFormat = new GeoJSON<Feature<Point>>();
const nextBusCollection = new Set<string>();
const source = new VectorSource({
    format: GeoJsonFormat,
    features: GeoJsonFormat.readFeatures(
      reducedBusStopSource
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

const getNextStop = (stopId: string, stopType: 'next' | 'cross') => {
  const timingEntry = stopTimings[state.alternatives.val].get(stopId);
  if (timingEntry === undefined || timingEntry[stopType] === undefined) {
    console.warn(`No next stop found for stop ID ${stopId}`);
    return undefined;
  }
  return timingEntry[stopType];
};

const processSelectedStop = (selected: Feature<Point>) => {
  walkShed.clear();
  let areaM2 = 0;
  const visitedStops = new Set<string>();
  const queue: { stop: string; remainingTime: number }[] = [
    { stop: selected.getId() as string, remainingTime: state.journeyTime.val * SECONDS_PER_MINUTE }
  ];

  while (queue.length > 0) {
    const { stop, remainingTime } = queue.shift()!;
    if (visitedStops.has(stop)) continue;
    visitedStops.add(stop);

    const geometry = source.getFeatureById(stop)?.getGeometry();
    if (geometry) {
      const walkshed = isochrone.calcIsochrone(
        geometry.getFirstCoordinate(),
        remainingTime
      );
      areaM2 += walkShed.setWalkShed(walkshed, stop);
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
  state.areaKm2.val = (areaM2 / SQ_METER_IN_SQ_KM).toFixed(2);
};

const onBusStopSelect = (stateSelect: HTMLSelectElement) => {
  const selectedFeatures = busSelect.getFeatures().getArray();
  nextBusCollection.clear();
  if (!selectedFeatures || selectedFeatures.length === 0) {
    return;
  }
  const selected = selectedFeatures[0] as Feature<Point>;
  stateSelect.value = selected.get('id');
  processSelectedStop(selected);
};

export const addSelectEvent = (map: OlMap, stateSelect: HTMLSelectElement, toListen: HTMLElement[]) => {
  map.addInteraction(busSelect);
  busSelect.on(["select"], () => onBusStopSelect(stateSelect));
  // When UI (time or transit inputs) change we recalculate the walkshed
  toListen.forEach(e => e.addEventListener('change', () => onBusStopSelect(stateSelect)), false);
  stateSelect.addEventListener('change', () => {
    const stopId = stateSelect.value;
    const feature = source.getFeatureById(stopId);
    if (feature) {
      // manipulate the array directly so we don't fire a change event
      const selectedArray = busSelect.getFeatures().getArray();
      selectedArray[0] = feature;
    }
    onBusStopSelect(stateSelect);
  }, false)
}
