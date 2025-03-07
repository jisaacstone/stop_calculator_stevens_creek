import VectorSource from 'ol/source/Vector.js';
import { MultiPoint, LineString } from 'ol/geom.js';
import { default as Select } from 'ol/interaction/Select.js';
import { click } from 'ol/events/condition.js';
import OSMXML from 'ol/format/OSMXML.js';
import { default as OlMap } from 'ol/Map.js';
import Feature from 'ol/Feature.js';
import { Vector as VectorLayer} from 'ol/layer.js';
import { all as allStrategy } from 'ol/loadingstrategy.js';
import { Text } from 'ol/style.js';
import { StyleFunction } from 'ol/style/Style.js';
import * as style from 'style';
import * as roads from 'roads';

type StopLink = { distance: number, id: number };
type StopInfo = { feature: Feature, next: StopLink, prev: StopLink, opposite: number | undefined };

const rapidBusNum = /\b523\b/;
const osmFormat = new OSMXML();
// const bb = [-122.05, 37.315, -121.9, 37.33];
const bb = '(37.315,-122.05,37.33,-121.9)';
const query = `(rel[route=bus][network=VTA]${bb};node(r)${bb}[public_transport=stop_position];);out body;`;
const busStopSource = new VectorSource({
  format: osmFormat,
  strategy: allStrategy,
  loader: (_extent, _resolution, projection, success, failure) => {
    console.log('loading from overpass');
    return fetch(
      'https://overpass-api.de/api/interpreter',
      { method: 'POST', body: query }
    ).then((response) => response.text())
    .then((text) => {
      console.log(text);
      const features = osmFormat.readFeatures(text, { featureProjection: projection });
      console.log(features);
      busStopSource.addFeatures(features);
      // TODO: read relation metadata
      (success || console.log)(features);
    }).catch(() => failure && failure());
  }
});

export const layer = new VectorLayer({
  source: busStopSource,
  style: (f, res) => {
    const stl = style.circle(15, res);
    if (res < 1) {
      stl.setText(new Text({text: f.get('name'), font: '12px Calibri,sans-serif'}));
    }
    return stl;
  }
})

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
const roadSelect = new Select({
  condition: click,
  layers: [ roads.scRoadGraph ],
  style: selected
});

export const addSelectEvent = (map: OlMap) => {
  map.addInteraction(busSelect);
  map.addInteraction(roadSelect);
  busSelect.on(["select"], ({ selected }) => {
    if (!selected || selected.length === 0) {
      return;
    }
    console.log(selected[0]);
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
