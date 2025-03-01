import VectorSource from 'ol/source/Vector.js';
import { MultiPoint } from 'ol/geom.js';
import Select from 'ol/interaction/Select.js';
import { click } from 'ol/events/condition.js';
import EsriJSON from 'ol/format/EsriJSON.js';
import Map from 'ol/Map.js';
import { Vector as VectorLayer} from 'ol/layer.js';
import { all as allStrategy } from 'ol/loadingstrategy.js';
import * as style from 'style';
import * as roads from 'roads';

const URLBase = 'https://gis.vta.org/gis/rest/services/Transit/Stops_Stations02242021/MapServer';
const BusStopLayer = '1';

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
    const url = `${URLBase}/${BusStopLayer}/query?where=1%3D1&outFields=*&outSR=${srid}&f=json`;
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

export const addSelectEvent = (map: Map) => {
  map.addInteraction(busSelect);
  map.addInteraction(roadSelect);
  busSelect.on(["select"], ({ selected }) => {
    if (!selected || selected.length === 0) {
      return;
    }
    const point: MultiPoint = selected[0].getGeometry() as MultiPoint;
    const { feature } = roads.closestPoint(point.getCoordinates()[0])
    const collection = roadSelect.getFeatures();
    collection.clear();
    collection.push(feature);
  });
}
