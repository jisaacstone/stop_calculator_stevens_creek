import View from 'ol/View.js';
import Map from 'ol/Map.js';
import van from 'vanjs-core';
import 'assets/style.css';
import * as layers from 'layers';
import * as roads from 'roads';
import * as ui from 'ui';
import * as isochrone from 'isochrone';
import * as walkShed from 'walkShed';
import * as busstops from 'busstops';
import * as state from 'state';

const setupSCMap = (mapEl: HTMLElement): Map => {
  const map = new Map({
    layers: [
      layers.osmRaster,
      roads.getLayer().layer,
      walkShed.walkShedLayer,
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

const setupInputs = (inputEl: HTMLElement) => {
  const journeyTimeSlider = ui.makeInput(
    { name: 'time', units: 'min' },
    { min: 5, max: 60, step: 5 },
    state.journeyTime,
  );
  const transitAlternativeSelect = ui.makeSelect(
    ['early', 'peak'],
    state.alternatives
  );
  van.add(
    inputEl,
    journeyTimeSlider,
    transitAlternativeSelect
  );
};

const main = () => {
  const mapEl = document.getElementById('stevenscreek');
  if (mapEl !== null) {
    const map = setupSCMap(mapEl);
    isochrone.loadNLD();
    busstops.addSelectEvent(map);
  }
  const inputEl = document.getElementById('input');
  if (inputEl !== null) {
    setupInputs(inputEl);
  }
};

if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
