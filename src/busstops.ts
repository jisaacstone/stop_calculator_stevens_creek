import VectorSource from 'ol/source/Vector.js';
import { MultiPoint, LineString } from 'ol/geom.js';
import Select from 'ol/interaction/Select.js';
import { click } from 'ol/events/condition.js';
import EsriJSON from 'ol/format/EsriJSON.js';
import { default as OlMap } from 'ol/Map.js';
import Feature from 'ol/Feature.js';
import { GeoJSON } from 'ol/format.js';
import { Vector as VectorLayer} from 'ol/layer.js';
import { all as allStrategy } from 'ol/loadingstrategy.js';
import { Text } from 'ol/style.js';
import { StyleFunction } from 'ol/style/Style.js';
import AmPeak from 'assets/AM_PEAK.json';
import * as style from 'style';
import * as roads from 'roads';

type StopLink = { distance: number, id: number };
type StopInfo = { feature: Feature, next: StopLink, prev: StopLink, opposite: number | undefined };

/** this one has line information
 * FID - object id
 * Shape - geometry (MultiPoint)
 * LineDirId - not sure
 * Stop Name - name of stop in plane text (eg "California/Showers")
 * RTID - A number which increments in the direction of the line
 * Routes - Comma seperated list of route names (eg "23, 523")
 * */
const altUrl = 'https://gis.vta.org/gis/rest/services/Transit/BusRoutes_StopsJanuary2020_ODP/MapServer/0'
const rapidBusNum = /\b523\b/;
const GeoJsonFormat = new GeoJSON();

const speedLayer = (arg: object) => new VectorLayer({
  source: new VectorSource({
    format: GeoJsonFormat,
    features: GeoJsonFormat.readFeatures(
      arg,
      {featureProjection: 'EPSG:3857'}
    )
  })
});

export const AMPeakLayer = speedLayer(AmPeak);

const busStopSource = new VectorSource({
  format: new EsriJSON(),
  url: function (_extent, _resolution, projection) {
    // ArcGIS Server only wants the numeric portion of the projection ID.
    const srid = projection
      .getCode()
      .split(/:(?=\d+$)/)
      .pop();
    // TODO: filter based on _extent
    // https://developers.arcgis.com/rest/services-reference/enterprise/query-feature-service-layer/
    const url = `${altUrl}/query?where=1%3D1&outFields=*&outSR=${srid}&f=json`;
    return url;
  },
  strategy: allStrategy,
});

export const layer = new VectorLayer({
  source: busStopSource,
  style: (f, res) => {
    const stl = f.get('Routes').match(rapidBusNum) ? style.poi : style.circle;
    if (res < 1) {
      stl.setText(new Text({text: f.get('StopName'), font: '12px Calibri,sans-serif'}));
    }
    return stl;
  }
})

const selected: StyleFunction = ((f: Feature) => {
  const ss = style.selected.clone();
  ss.setText(new Text({text: f.get('StopName'), font: '12px Calibri,sans-serif'}));
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
    console.log(`${selected[0].get('Routes')}|${selected[0].get('RTID')}|${selected[0].get('LineDirId')}|${selected[0].get('FID')}`);
    const info = lineInfo().get(selected[0].get('FID'));
    if (info) {
      const collection = roadSelect.getFeatures();
      collection.clear();
      [
        selected[0],
        lineInfo().get(info.next)?.feature,
        lineInfo().get(info.opposite)?.feature
      ].forEach(f => {
        if (f) {
          const point: MultiPoint = f.getGeometry() as MultiPoint;
          const { feature } = roads.closestPoint(point.getCoordinates()[0]);
          collection.push(feature);
        }
      });
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
