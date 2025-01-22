import View from 'ol/View.js';
import { fromLonLat } from 'ol/proj.js';
import { Polygon } from 'ol/geom.js';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
// import { intersect } from "@turf/intersect";
import 'assets/style.css';
import * as layers from 'layers';

const GRID = 111.32;
type Diamond = [[number, number], [number, number], [number, number], [number, number]];

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

const drawDiamonds = (spacing: number, timePerStop: number, walkSpeed: number, totalTime: number, numstops: number): [Diamond[], Diamond[]] => {
  var lng = 0;
  var checkOverlap = true;
  const dmds: Diamond[] = [drawDiamond([0,0], totalTime, walkSpeed)];
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
        console.log({ dmds, lng_a, lng_b, offset, center });
        overlaps.push([[lng_b, 0], [center, offset], [lng_a, 0], [center, -offset]]);
        // There will be a mirror overlap
        overlaps.push([[-lng_b, 0], [-center, offset], [-lng_a, 0], [-center, -offset]]);
      } else {
        console.log({ lng_a, lng_b, a: dmds[0], b: dmds[1] });
        checkOverlap = false;
      }
    }
  }
  return [dmds, overlaps];
}

const clip = () => {
  const src = layers.clip.getSource();
  if (src) {
    const [dmds, overlaps] = drawDiamonds(GRID * 8, 90, 0.7, 60 * 15, 20);
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
  }
};

const setupMap = (mapEl: HTMLElement): Map => {
  const map = new Map({
    layers: [
      layers.grid,
      layers.clip,
      layers.osmRaster,
    ],
    target: mapEl,
    view: new View({
      center: fromLonLat([0,0]),
      zoom: 14
    }),
  });
  /*
  layers.grid.getSource()?.on('change', function () {
    if (layers.grid.getSource()?.getState() === 'ready') {
      console.log(layers.grid.getSource()?.getFeatures());
      const extent = layers.grid.getSource()?.getExtent();
      console.log(extent);
      extent && map.getView().fit(extent);
    }
  });
  */
  const extent = layers.grid.getSource()?.getExtent();
  extent && map.getView().fit(extent);
  clip();
  return map;
};

const main = () => {
  const mapEl = document.getElementById('map');
  if (mapEl !== null) {
    setupMap(mapEl);
  }
};

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
