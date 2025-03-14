import View from 'ol/View.js';
import Map from 'ol/Map.js';
import van from 'vanjs-core';
import 'assets/style.css';
import * as layers from 'layers';
import * as roads from 'roads';
import * as slider from 'slider';
import * as isochrone from 'isochrone';
import * as walkShed from 'walkShed';
import * as busstops from 'busstops';

const distance = van.state(2);

const setupSCMap = (mapEl: HTMLElement): Map => {
  const map = new Map({
    layers: [
      layers.osmRaster,
      roads.scRoadGraph,
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

  map.getView().fit(busstops.layer.getSource().getExtent());

  return map;
};

const setupInputs = (inputEl: HTMLElement) => {
  const slide = slider.makeInput(
    { name: 'distance', units: 'm' },
    { min: 1, max: 20, step: 2 },
    distance,
  );
  van.add(inputEl, slide);
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
