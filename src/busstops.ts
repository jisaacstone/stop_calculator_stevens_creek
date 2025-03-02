import VectorSource from 'ol/source/Vector.js';
import { MultiPoint } from 'ol/geom.js';
import Select from 'ol/interaction/Select.js';
import { click } from 'ol/events/condition.js';
import EsriJSON from 'ol/format/EsriJSON.js';
import { default as OlMap } from 'ol/Map.js';
import Feature from 'ol/Feature.js';
import { Vector as VectorLayer} from 'ol/layer.js';
import { all as allStrategy } from 'ol/loadingstrategy.js';
import * as style from 'style';
import * as roads from 'roads';

type StopInfo = { feature: Feature, next: number, opposite: number | null };

/** this one has line information
 * FID - object id
 * Shape - geometry (MultiPoint)
 * LineDirId - not sure
 * Stop Name - name of stop in plane text (eg "California/Showers")
 * RTID - A number which increments in the direction of the line
 * Routes - Comma seperated list of route names (eg "23, 523")
 * */
const altUrl = 'https://gis.vta.org/gis/rest/services/Transit/BusRoutes_StopsJanuary2020_ODP/MapServer/0'
// const URLBase = 'https://gis.vta.org/gis/rest/services/Transit/Stops_Stations02242021/MapServer/1';

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
})

const busSelect = new Select({
  condition: click,
  layers: [ layer ],
  style: () => style.selected
});
const roadSelect = new Select({
  condition: click,
  layers: [ roads.scRoadGraph ],
  style: () => style.selected
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

export const lineInfo = (() => {
  // cache the result here so we only calculate once
  const infoMap = new Map<number, StopInfo>();
  // regex hard-coded for line 23
  const busNum = /\b23\b/;
  let calculated = false;

  const calculat = (): boolean => {
    // check stop opposite by stop name.
    // this is imperfect as they do not always match.
    // perhaps checking cloastest by distance is better?
    const opposing = new Map<string, number>();
    const sorted: Feature[] = (
      busStopSource.getFeatures()
      .filter((feature: Feature) => feature.get('Routes')?.match(busNum))
      .sort((f1: Feature, f2: Feature) => f1.get('RTID') - f2.get('RTID'))
    );
    let feature = sorted[sorted.length - 1];
    for (const next of sorted) {
      const id = feature.get('FID');
      const stop = feature.get('StopName');
      const info: StopInfo = { feature, next: next.get('FID'), opposite: null };
      if (stop && opposing.has(stop)) {
        info.opposite = opposing.get(stop);
        infoMap.get(opposing.get(stop)).opposite = id;
      } else {
        opposing.set(stop, id);
      }
      infoMap.set(id, info);
      feature = next;
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
