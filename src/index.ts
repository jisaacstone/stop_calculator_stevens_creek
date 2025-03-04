import View from 'ol/View.js';
import SelectEvent from 'ol/MapEvent.js';
import Select from 'ol/interaction/Select.js';
import { click } from 'ol/events/condition.js';
import { fromLonLat } from 'ol/proj.js';
import Map from 'ol/Map.js';
import van from 'vanjs-core';
import 'assets/style.css';
import * as layers from 'layers';
import * as roads from 'roads';
import * as slider from 'slider';
import * as style from 'style';
import * as isochrone from 'isochrone';
import * as walkShed from 'walkShed';
import * as busstops from 'busstops';

const distance = van.state(2);

const setupSCMap = (mapEl: HTMLElement): Map => {
  const map = new Map({
    layers: [
      layers.osmRaster,
      roads.scRoadGraph,
      busstops.layer,
      walkShed.walkShedLayer
    ],
    target: mapEl,
    view: new View({
      center: fromLonLat([37.323,-121.5]),
      zoom: 14
    }),
  });
  busstops.addSelectEvent(map);
  const featSelect = new Select({
    condition: click,
    layers: [ roads.scRoadGraph ],
    style: () => style.selected
  });
  map.addInteraction(featSelect);
  featSelect.on("select", (evt: SelectEvent) => {
    if (!evt.selected || evt.selected.length === 0) {
      return;
    }
    const neighbors = isochrone.neighbors(evt.selected[0].get('id'));
    walkShed.setWalkShed(neighbors, 'neighbors');
  });
  map.getView().fit(roads.scRoadGraph.getSource().getExtent());

  const busstop = 4168013077;
  const walkshed = isochrone.calcIsochrone(busstop, 300);
  walkShed.setWalkShed(Array.from(walkshed), 'walkshed');

  return map;
};

const setupInputs = (inputEl: HTMLElement) => {
  const slide = slider.makeInput(
    {name: 'distance', units: 'm'},
    {min: 1, max: 20, step: 2},
    distance,
  );
  van.add(inputEl, slide);
};

const main = () => {
  const mapEl = document.getElementById('stevenscreek');
  if (mapEl !== null) {
    setupSCMap(mapEl);
  }
  const inputEl = document.getElementById('input');
  if (inputEl !== null) {
    setupInputs(inputEl);
  }
};

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
