import View from 'ol/View.js';
import Map from 'ol/Map.js';

import 'assets/style.css';

import * as busstops from 'busstops';
import * as isochrone from 'isochrone';
import * as layers from 'layers';
import * as roads from 'roads';
import * as ui from 'ui';
import * as walkShed from 'walkShed';
import * as state from 'state';
import * as poi from 'poi';

const setupSCMap = (mapEl: HTMLElement): Map => {
  const map = new Map({
    layers: [
      layers.osmRaster,
      walkShed.walkShedLayer,
      walkShed.polyLayer,
      poi.layer,
      busstops.layer,
    ],
    target: mapEl,
    view: new View({
      center: [37.323,-121.5],
      projection: 'EPSG:4326',
      zoom: 14
    }),
  });

  const src = busstops.layer.getSource();
  if (src) {
    map.getView().fit(src.getExtent());
  }

  return map;
};


const main = () => {
  const mapEl = document.getElementById('stevenscreek');
  const inputEl = document.getElementById('input');
  if (inputEl !== null) {
    const inputMap = ui.setupUi(inputEl);
    if (mapEl !== null) {
      const map = setupSCMap(mapEl);
      busstops.addSelectEvent(
        map,
        inputMap.busStop,
        [inputMap.journeyTime]
      );
      // start loading of road data & graph in background
      Promise.all([
        isochrone.loadNLD(),
        roads.loadLayer(),
      ]).then(() => {
        // check if user selected anything while we were loading
        if (state.selectedStopId.val === '') {
          inputMap.busStop.value = 'node/6739935094';
          inputMap.busStop.dispatchEvent(new Event('change'));
        }
      })
    }
  }
};

if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
