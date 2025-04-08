// OpenLayers Core Imports
import { default as OlMap } from 'ol/Map.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { buffer } from 'ol/extent.js';
import VectorSource from 'ol/source/Vector.js';
import * as turf from '@turf/turf';

// Geometry Imports
import { Point } from 'ol/geom.js';
import * as GJ from 'geojson';

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
import { busGraph as stopTimings } from 'stopTimings.ts';

// Local Module Imports
import * as style from 'style';
import * as isochrone from 'isochrone';
import * as walkShed from 'walkShed';
import * as state from 'state';
import * as poi from 'poi';
import { withLoader } from 'loader';
import { SECONDS_PER_MINUTE, SQ_METER_IN_SQ_MI } from 'constants';

type BusOrBrt = { bus: number, brt: number };
type Poly = GJ.Feature<GJ.Polygon,GJ.GeoJsonProperties>;
type Polys = { bus: Poly[], brt: Poly[] };

// Collect all stop IDs from stopTimings
const stopTimingIds = new Set(stopTimings.keys());

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

const selected: StyleFunction = ((_: Feature, r: number) => {
  const ss = style.selected(15, r);
  return ss;
}) as StyleFunction;

const busSelect = new Select({
  condition: click,
  layers: [ layer ],
  style: selected
});

const getNextStop = (stopId: string) => {
  const timingEntry = stopTimings.get(stopId);
  if (timingEntry === undefined || timingEntry.next === undefined) {
    console.warn(`No next stop found for stop ID ${stopId}`);
    return undefined;
  }
  return {
    id: timingEntry.next,
    bus: timingEntry.bus * SECONDS_PER_MINUTE,
    brt: timingEntry.brt * SECONDS_PER_MINUTE
  };
};

const processSelectedStop = async (selected: Feature<Point>) => {
  walkShed.clear();
  const polys: Polys = { bus: [], brt: [] };
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
          console.log(`calculation ${remainingTimes[key]} second walkshed`);
          const coord = geometry.getFirstCoordinate();
          const prom = isochrone.calcIsochrone(
            coord,
            remainingTimes[key]
          ).then(walkshed => {
            if (walkshed) {
              const polygon = walkShed.setWalkShed(walkshed, key);
              if (polygon) {
                polys[key].push(polygon);
              }
            }
          });
          polyPromises.push(prom);
        }
      };
    }

    // Add accessible stops to the queue if there’s enough remaining time
    const nextStop = getNextStop(stop);
    if (nextStop) {
      nextBusCollection.add(nextStop.id);
      if (remainingTimes.brt >= nextStop.brt) {
        queue.push({ stop: nextStop.id, remainingTimes: { brt: remainingTimes.brt - nextStop.brt, bus: remainingTimes.bus - nextStop.bus }});
      }
    }
  }
  // polys array is being populated async
  await Promise.all(polyPromises);
  const areaM2 = walkShed.setCatchement(polys);
  if (areaM2) {
    state.busAreaMi2.val = (areaM2.bus / SQ_METER_IN_SQ_MI).toFixed(2);
    state.brtAreaMi2.val = (areaM2.brt / SQ_METER_IN_SQ_MI).toFixed(2);
    state.brtToBusAreaRatio.val = (areaM2.brt / areaM2.bus).toFixed(1) + 'x';
  }
  return polys;
};

const setExtent = (polys: Poly[], map: OlMap) => {
  console.log('setting extent');
  const bbox = turf.bbox(turf.featureCollection(polys));
  console.log(bbox);
  // buffer around 100 meters - no need to be exact
  map.getView().fit(buffer(bbox, 0.001));
};

const setPoiCount = (polys: Polys) => {
  const busPoi = poi.pointsInPolygons(polys.bus);
  const brtPoi = poi.pointsInPolygons(polys.brt);
  const busCount = busPoi.features.length;
  const brtCount = brtPoi.features.length;
  state.busPoi.val = busCount;
  state.brtPoi.val = brtCount;
  state.brtToBusPoiRatio.val = (brtCount / busCount).toFixed(1) + 'x';
};

const onBusStopSelect = (stopSelect: HTMLSelectElement, map: OlMap) => {
  return withLoader(() => {
    const selectedFeatures = busSelect.getFeatures().getArray();
    nextBusCollection.clear();
    if (!selectedFeatures || selectedFeatures.length === 0) {
      console.log('no selected features');
      return Promise.resolve();
    }
    const selected = selectedFeatures[0] as Feature<Point>;
    stopSelect.value = selected.get('id');
    return processSelectedStop(selected).then(polys => {
      setExtent(polys.brt, map);
      setPoiCount(polys);
    });
  });
};

export const addSelectEvent = (map: OlMap, stopSelect: HTMLSelectElement, toListen: HTMLElement[]) => {
  map.addInteraction(busSelect);
  busSelect.on(["select"], () => onBusStopSelect(stopSelect, map));
  // When UI (time or transit inputs) change we recalculate the walkshed
  toListen.forEach(e => e.addEventListener('change', () => onBusStopSelect(stopSelect, map)), false);
  stopSelect.addEventListener('change', () => {
    const stopId = stopSelect.value;
    const feature = source.getFeatureById(stopId);
    if (feature) {
      // manipulate the array directly so we don't fire a change event
      const selectedArray = busSelect.getFeatures().getArray();
      selectedArray[0] = feature;
    }
    onBusStopSelect(stopSelect, map);
  }, false)
}
