import View from 'ol/View.js';
import SelectEvent from 'ol/MapEvent.js';
import Select from 'ol/interaction/Select.js';
import { click } from 'ol/events/condition.js';
import { fromLonLat } from 'ol/proj.js';
import Map from 'ol/Map.js';
import van from 'vanjs-core';
import 'assets/style.css';
import * as layers from 'layers';
import * as slider from 'slider';
import * as walkgrid from 'walkgrid';
import * as style from 'style';
import * as isochrone from 'isochrone';
import * as walkShed from 'walkShed';
import * as busstops from 'busstops';

const distance = van.state(walkgrid.GRID * 3);
const walkArea = van.state(0);
const areaEl = van.tags.div(van.derive(
  () => `${Math.round(distance.val / walkgrid.GRID)} blocks, ${Math.round(walkArea.val).toLocaleString()} m²`
));
const makeGridFn = walkgrid.makeGrid(layers.grid.getSource(), distance, walkArea);

const setupGridMap = (mapEl: HTMLElement): Map => {
  const map = new Map({
    layers: [
      layers.grid,
      layers.walk,
    ],
    target: mapEl,
    view: new View({
      center: fromLonLat([0,0]),
      zoom: 14
    }),
  });
  makeGridFn(map);
  map.getView().fit(walkgrid.EXTENT);
  return map;
};

const setupSCMap = (mapEl: HTMLElement): Map => {
  const map = new Map({
    layers: [
      layers.osmRaster,
      layers.scRoadGraph,
      busstops.layer,
      walkShed.walkShedLayer
    ],
    target: mapEl,
    view: new View({
      center: fromLonLat([37.323,-121.5]),
      zoom: 14
    }),
  });
  const featSelect = new Select({
    condition: click,
    layers: [ layers.scRoadGraph ],
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
  map.getView().fit(layers.scRoadGraph.getSource().getExtent());

  const busstop = 4168013077;
  const walkshed = isochrone.calcIsochrone(busstop, 300);
  console.log(walkshed);
  layers.scRoadGraph.getSource()?.getFeatures().forEach((f) => {
    if(walkshed.found.has(f.get('id'))) {
      f.setStyle(style.walk);
    } else if (walkshed.incomplete.has(f.get('id'))) {
      f.setStyle(style.walkEdge);
    }
  });

  return map;
};

const setupInputs = (inputEl: HTMLElement, map: Map) => {
  const slide = slider.makeInput(
    {name: 'distance', units: 'm'},
    {min: walkgrid.GRID, max: walkgrid.GRID * 20, step: walkgrid.GRID},
    distance,
    () => makeGridFn(map)
  );
  van.add(slide, areaEl);
  van.add(inputEl, slide);
};

const main = () => {
  const mapEl = document.getElementById('map');
  if (mapEl !== null) {
    const map = setupGridMap(mapEl);
    const inputEl = document.getElementById('input');
    if (inputEl !== null) {
      setupInputs(inputEl, map);
    }
  }
  const map2 = document.getElementById('stevenscreek');
  if (map2 !== null) {
    setupSCMap(map2);
  }
};

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
