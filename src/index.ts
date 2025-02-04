import View from 'ol/View.js';
import { fromLonLat } from 'ol/proj.js';
import { LineString, MultiLineString, Point } from 'ol/geom.js';
import Feature from 'ol/Feature.js';
import { createEmpty, getArea } from 'ol/extent.js';
import {GeoJSON} from 'ol/format.js';
import Map from 'ol/Map.js';
import van from 'vanjs-core';
import 'assets/style.css';
import * as turf from '@turf/turf';
import * as layers from 'layers';
import * as style from 'style';
import * as slider from 'slider';

const GRID = 111.32;
type Diamond = [[number, number], [number, number], [number, number], [number, number]];
const distance = van.state(GRID * 3);
const walkArea = van.state(0);
const areaEl = van.tags.div(van.derive(
  () => `${Math.round(distance.val / GRID)} blocks, ${Math.round(walkArea.val).toLocaleString()} m²`
));
const GeoJsonFormat = new GeoJSON();

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
    if (totalTime < 0) {
      break;
    }
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

const drawRoads = (dmd: Diamond) => {
  let [[lng,lat1],[lng1,lat],[,lat2],[lng2,]] = dmd;
  const lines = [[[lng1,lat],[lng2,lat]], [[lng,lat1],[lng,lat2]]];
  for (let dlat = GRID; dlat < Math.abs(lat1); dlat += GRID) {
    lng1 += GRID;
    lng2 -= GRID;
    lines.push([[lng1,dlat], [lng2,dlat]]);
    lines.push([[lng1,-dlat], [lng2,-dlat]]);
  }
  for (let dlng = GRID; dlng < Math.abs(lat1); dlng += GRID) {
    lat1 += GRID;
    lat2 -= GRID;
    lines.push([[lng + dlng,lat1], [lng + dlng,lat2]]);
    lines.push([[lng - dlng,lat1], [lng - dlng,lat2]]);
  }
  return lines;
}

const makeGrid = (() => {
  const src = layers.walk.getSource();
  if (src) {
    return (map: Map) => {
      src.clear()
      const timeBetweenStops = 20 + 0.1*distance.val;
      const [dmds, overlaps] = calcDiamonds(+distance.val, timeBetweenStops, 0.7, 60 * 15, 50);
      let area = 0;
      const centroids = calcCentroids(+distance.val, dmds.length);
      centroids.forEach((c) => {
        src.addFeature(
          new Feature({
            geometry: new Point(c),
            cat: "station",
            style: style.circle
          })
        );
      });
      src.addFeature(
        new Feature({
          geometry: new LineString([centroids.pop(), centroids.pop()]),
          cat: "main"
        })
      );

      const _polys = turf.union(turf.featureCollection(
        dmds.map(dmd => turf.polygon([[...dmd, dmd[0]]]))
      ));
      const polys = GeoJsonFormat.readFeatures(_polys)[0];
      area = polys.getGeometry()?.getArea();
      src.addFeature(polys);
      if (overlaps.length > 1) {
        const _overs = turf.union(turf.featureCollection(
          overlaps.map(dmd => turf.polygon([[...dmd, dmd[0]]]))
        ));
        const overs = GeoJsonFormat.readFeatures(_overs)[0];
        overs.setProperties({"cat": "overlap"});
        area -= overs.getGeometry()?.getArea();
        src.addFeature(overs);
      }

      dmds.forEach((dmd) => {
        const roads = drawRoads(dmd);
        src.addFeature(
          new Feature({
            geometry: new MultiLineString(roads),
            cat: "road"
          })
        );
      });

      //const extent = src.getExtent() || createEmpty();
      //map.getView().fit(extent);

      walkArea.val = area;
    };
  }
  return () => null;
})();

const setupMap = (mapEl: HTMLElement): Map => {
  const map = new Map({
    layers: [
      //layers.grid,
      layers.walk,
    ],
    target: mapEl,
    view: new View({
      center: fromLonLat([0,0]),
      zoom: 14
    }),
  });
  makeGrid(map);
  map.getView().fit([-7200, -630, 7200, 630]);
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
      van.add(inputEl, areaEl);
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
