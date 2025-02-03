import View from 'ol/View.js';
import { fromLonLat } from 'ol/proj.js';
import { Polygon, MultiPolygon, Point } from 'ol/geom.js';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import Crop from 'ol-ext/filter/Crop.js';
import van from 'vanjs-core';
import 'assets/style.css';
import * as layers from 'layers';
import * as style from 'style';
import * as slider from 'slider';

const GRID = 111.32;
type Diamond = [[number, number], [number, number], [number, number], [number, number]];
const distance = van.state(GRID * 3);

const drawDiamond = (center: [number, number], time: number, walkSpeed: number): Diamond => {
  const [lng, lat] = center;
  const dist = time * walkSpeed;
  return [
    [lng, lat - dist],
    [lng - dist, lat],
    [lng, lat + dist],
    [lng + dist, lat]
  ];
}

const calcCentroids = (spacing: number, numstops: number): [number, number][] => {
  const ctds: [number, number][] = [[0, 0]];
  var offset = 0;
  for (var i = 1; i<numstops/2; i++) {
    offset += spacing;
    ctds.push([offset, 0]);
    ctds.push([-offset, 0]);
  }
  return ctds;
};

const calcDiamonds = (spacing: number, timePerStop: number, walkSpeed: number, totalTime: number, numstops: number): [Diamond[], Diamond[]] => {
  var lng = 0;
  var checkOverlap = true;
  const dmds: Diamond[] = [drawDiamond([0,0], totalTime, walkSpeed)];
  console.log(dmds[0], totalTime, walkSpeed);
  const overlaps: Diamond[] = [];
  for (var i = 1; i<numstops/2; i++) {
    lng += spacing;
    totalTime -= timePerStop;
    // Push and unshift keep things in order for overlap check
    dmds.push(drawDiamond([lng, 0], totalTime, walkSpeed));
    dmds.unshift(drawDiamond([-lng, 0], totalTime, walkSpeed));
    if (checkOverlap) {
      // Check the first two entries
      const [[, , ,[lng_a,]], [,[lng_b,]]] = dmds;
      if (lng_a > lng_b) {
        const offset = (lng_a - lng_b) / 2;
        const center = lng_b + offset;
        overlaps.push([[lng_b, 0], [center, offset], [lng_a, 0], [center, -offset]]);
        // There will be a mirror overlap
        overlaps.push([[-lng_b, 0], [-center, offset], [-lng_a, 0], [-center, -offset]]);
      } else {
        checkOverlap = false;
      }
    }
  }
  return [dmds, overlaps];
}

const makeGrid = (() => {
  const src = layers.walk.getSource();
  //const filters = {grid: null, grid2: null};
  if (src) {
    return (map: Map) => {
      src.clear()
      //layers.grid.removeFilter(filters.grid);
      //layers.grid2.removeFilter(filters.grid2);

      const [dmds, overlaps] = calcDiamonds(+distance.val, 90, 0.7, 60 * 15, 20);
      console.log(distance.val, dmds)
      const centroids = calcCentroids(distance.val, 20);
      centroids.forEach((c) => {
        src.addFeature(
          new Feature({
            geometry: new Point(c),
            cat: "station",
            style: style.circle
          })
        );
      });
      dmds.forEach((dmd) => {
        src.addFeature(
          new Feature({
            geometry: new Polygon([dmd]),
            cat: "walk"
          })
        );
      });
      overlaps.forEach((dmd) => {
        src.addFeature(
          new Feature({
            geometry: new Polygon([dmd]),
            cat: "overlap"
          })
        );
      });
      /*
      const crop = new Feature({ geometry: new MultiPolygon([...dmds.map(d => [d]), ...overlaps.map(d => [d])])});
      filters.grid = new Crop({feature: crop});
      layers.grid.addFilter(filters.grid);
      filters.grid2 = new Crop({feature: crop, inner: true, wrapX: true});
      layers.grid2.addFilter(filters.grid2);
      */
      const extent = src.getExtent();
      extent && map.getView().fit(extent);
    };
  }
  return () => null;
})();

const setupMap = (mapEl: HTMLElement): Map => {
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
  makeGrid(map);
  return map;
};

const setupInputs = (inputEl: HTMLElement, map: Map) => {
  van.add(
    inputEl,
    slider.makeInput(
      {name: 'distance', units: 'm'},
      {min: GRID, max: GRID * 20, step: GRID},
      distance,
      () => makeGrid(map)
    )
  );
};

const main = () => {
  const mapEl = document.getElementById('map');
  if (mapEl !== null) {
    const map = setupMap(mapEl);
    const inputEl = document.getElementById('input');
    if (inputEl !== null) {
      setupInputs(inputEl, map);
    }
  }
};

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
