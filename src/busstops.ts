import VectorSource from 'ol/source/Vector.js';
import { MultiPoint, LineString, Point } from 'ol/geom.js';
import { default as Select } from 'ol/interaction/Select.js';
import { click } from 'ol/events/condition.js';
import { GeoJSON } from 'ol/format.js';
import { default as OlMap } from 'ol/Map.js';
import Feature from 'ol/Feature.js';
import { Vector as VectorLayer} from 'ol/layer.js';
import busStopSource from 'assets/busstops-geojson.json';
import { Text } from 'ol/style.js';
import { StyleFunction } from 'ol/style/Style.js';
import * as style from 'style';
import * as isochrone from 'isochrone';
import * as walkShed from 'walkShed';

type StopLink = { distance: number, id: number };
type StopInfo = { feature: Feature, next: StopLink, prev: StopLink, opposite: number | undefined };

const rapidBusNum = /\b523\b/;
const GeoJsonFormat = new GeoJSON<Feature<Point>>();
export const layer = new VectorLayer({
  source: new VectorSource({
    format: GeoJsonFormat,
    features: GeoJsonFormat.readFeatures(
      busStopSource
    )
  }),
  style: (f, res) => {
    const stl = style.circle(15, res);
    if (res < .00001) {
      stl.setText(new Text({text: f.get('name'), font: '12px Calibri,sans-serif'}));
    }
    return stl;
  }
});

const selected: StyleFunction = ((f: Feature) => {
  const ss = style.selected.clone();
  ss.setText(new Text({text: f.get('name'), font: '12px Calibri,sans-serif'}));
  return ss;
}) as StyleFunction;
const busSelect = new Select({
  condition: click,
  layers: [ layer ],
  style: selected
});

export const addSelectEvent = (map: OlMap) => {
  map.addInteraction(busSelect);
  busSelect.on(["select"], (event) => {
    if (!event.selected || event.selected.length === 0) {
      return;
    }
    const selected = event.selected[0] as Feature<Point>;
    console.log(selected);
    const geometry = selected.getGeometry();
    if (geometry) {
      const walkshed = isochrone.calcIsochrone(geometry.getFirstCoordinate(), 300);
      walkShed.setWalkShed(Array.from(walkshed), 'walkshed');
    }
  });
}

// calculate distance by drawing a line and measuring it's length
const dist = (f1: Feature<MultiPoint>, f2: Feature<MultiPoint>): number => {
  const p1 = f1.getGeometry()?.getFirstCoordinate();
  const p2 = f2.getGeometry()?.getFirstCoordinate();
  if (p1 && p2) {
    return new LineString([p1, p2]).getLength();
  }
  throw "no point";
};

// TODO: rewrite after getting relation information from the overpass call
export const lineInfo = (() => {
  // cache the result here so we only calculate once
  const infoMap = new Map<number, StopInfo>();
  // regex hard-coded for line 23
  let calculated = false;

  const calculat = (): boolean => {
    const opposing = new Map<string, number>();
    const sorted: Feature<MultiPoint>[] = (
      (busStopSource.getFeatures() as Feature<MultiPoint>[])
      .filter((feature: Feature) => feature.get('Routes')?.match(rapidBusNum))
      .sort((f1: Feature, f2: Feature) => f1.get('RTID') - f2.get('RTID'))
    );
    let current = sorted[sorted.length - 1];
    let prev = sorted[sorted.length - 2];
    for (const next of sorted) {
      const id = current.get('FID');
      const stopName = current.get('StopName');
      const info: StopInfo = {
        feature: current,
        next: { id: next.get('FID'), distance: dist(current, next) },
        prev: { id: prev.get('FID'), distance: dist(prev, current) },
        opposite: undefined
      };
      // check stop opposite by stop name.
      // this is imperfect as they do not always match.
      // perhaps checking cloastest by distance is better?
      if (stopName && opposing.has(stopName)) {
        info.opposite = opposing.get(stopName);
        const o = infoMap.get(opposing.get(stopName) || 0)
        if (o) {
          o.opposite = id;
        }
      } else {
        opposing.set(stopName, id);
      }
      infoMap.set(id, info);
      prev = current;
      current = next;
    }
    return true;
  };

  // return cached or calculate
  return () => {
    if (!calculated) {
      if (calculat()) {
        calculated = true;
      }
    }
    return infoMap;
  };
})();
