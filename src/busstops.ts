// OpenLayers Core Imports
import { default as OlMap } from 'ol/Map.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import VectorSource from 'ol/source/Vector.js';

// Geometry Imports
import { Point } from 'ol/geom.js';
import { Polygon as GJPoly } from 'geojson';

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
import { withLoader } from 'loader';
import { SECONDS_PER_MINUTE, SQ_METER_IN_SQ_KM } from 'constants';

type BusOrBrt = { bus: number, brt: number };
// Look at stop across the street
const considerCrossStop = false;

// Collect all stop IDs from stopTimings
const stopTimingIds = new Set([
  ...Array.from(stopTimings.bus.keys()),
  ...Array.from(stopTimings.brt.keys())
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
  //  ss.setText(new Text({text: f.get('name'), font: '12px Calibri,sans-serif'}));
  return ss;
}) as StyleFunction;

const busSelect = new Select({
  condition: click,
  layers: [ layer ],
  style: selected
});

const getNextStop = (stopId: string, stopType: 'next' | 'cross') => {
  const timingEntryBus = stopTimings.bus.get(stopId);
  if (timingEntryBus === undefined || timingEntryBus[stopType] === undefined) {
    console.warn(`No next stop found for stop ID ${stopId}`);
    return undefined;
  }
  const timingEntryBrt = stopTimings.brt.get(stopId);
  if (timingEntryBrt === undefined || timingEntryBrt[stopType] === undefined) {
    console.warn(`No next stop found for stop ID ${stopId}`);
    return undefined;
  }
  return {
    id: timingEntryBus[stopType].id,
    bus: timingEntryBus[stopType].cost * SECONDS_PER_MINUTE,
    brt: timingEntryBrt[stopType].cost * SECONDS_PER_MINUTE
  };
};

const processSelectedStop = async (selected: Feature<Point>) => {
  walkShed.clear();
  const polys: { bus: GJPoly[], brt: GJPoly[] } = { bus: [], brt: [] }
  const visitedStops = new Set<string>();
  const journeyTimeSec = state.journeyTime.val * SECONDS_PER_MINUTE;
  const queue: { stop: string; remainingTimes: BusOrBrt }[] = [
    { stop: selected.getId() as string, remainingTimes: { bus: journeyTimeSec, brt: journeyTimeSec } }
  ];
  const polyPromises: Promise<void>[] = [];

  while (queue.length > 0) {
    const { stop, remainingTimes } = queue.shift()!;
    if (visitedStops.has(stop)) continue;
    visitedStops.add(stop);

    const geometry = source.getFeatureById(stop)?.getGeometry();
    if (geometry) {
      for (const key of Object.keys(remainingTimes) as Array<keyof BusOrBrt>) {
        // cannot really walk anywhere in 5 seconds or less (this could be negative here)
        if (remainingTimes[key] > 5) {
          const coord = geometry.getFirstCoordinate();
          const prom = isochrone.calcIsochrone(
            coord,
            remainingTimes[key]
          ).then(walkshed => {
            if (walkshed) {
              const polygon = walkShed.setWalkShed(walkshed, key)
              polys[key].push(polygon);
            }
          });
          polyPromises.push(prom);
        }
      };
    }

    // Add accessible stops to the queue if there’s enough remaining time
    const nextStop = getNextStop(stop, 'next');
    if (nextStop) {
      nextBusCollection.add(nextStop.id);
      if (remainingTimes.brt >= nextStop.brt) {
        queue.push({ stop: nextStop.id, remainingTimes: { brt: remainingTimes.brt - nextStop.brt, bus: remainingTimes.bus - nextStop.bus }});
      }
    }
    if (considerCrossStop) {
      const crossStop = getNextStop(stop, 'cross');
      if (crossStop) {
        nextBusCollection.add(crossStop.id);
        if (remainingTimes.brt >= crossStop.brt) {
          queue.push({ stop: crossStop.id, remainingTimes: { brt: remainingTimes.brt - crossStop.brt, bus: remainingTimes.bus - crossStop.bus }});
        }
      }
    }
  }
  // polys array is being populated async
  await Promise.all(polyPromises);
  const areaM2 = walkShed.setCatchement(polys);
  if (areaM2) {
    state.busAreaKm2.val = (areaM2.bus / SQ_METER_IN_SQ_KM).toFixed(2);
    state.brtAreaKm2.val = (areaM2.brt / SQ_METER_IN_SQ_KM).toFixed(2);
    state.brtToBusRatio.val = (areaM2.brt / areaM2.bus).toFixed(2);
  }
};

const onBusStopSelect = (stateSelect: HTMLSelectElement) => {
  return withLoader(() => {
    console.log('bss');
    const selectedFeatures = busSelect.getFeatures().getArray();
    nextBusCollection.clear();
    if (!selectedFeatures || selectedFeatures.length === 0) {
      return Promise.resolve();
    }
    const selected = selectedFeatures[0] as Feature<Point>;
    stateSelect.value = selected.get('id');
    return processSelectedStop(selected);
  });
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
