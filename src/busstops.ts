import VectorSource from 'ol/source/Vector.js';
import EsriJSON from 'ol/format/EsriJSON.js';
import { Vector as VectorLayer} from 'ol/layer.js';
import { all as allStrategy } from 'ol/loadingstrategy.js';

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
