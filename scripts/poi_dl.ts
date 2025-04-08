import { writeFileSync } from 'fs';
import * as turf from '@turf/turf';

export const fetchOSMData = async (query: string, fileName: string) => {
  try {
    console.log("Fetching OSM JSON data...");
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    if (!response.ok) {
      throw new Error(`OSM API Error: ${response.statusText}`);
    }

    const osmData = await response.json();
    const features = osmData.elements.map(
      element => {
        const { type, id, tags } = element;
        const { lat, lon } = element.center ? element.center : element;
        console.log(element);
        return  turf.point(
          [lon, lat],
          tags,
          {id: `${type}/${id}`}
        );
      }
    );

    const geojson = turf.featureCollection(features);

    // Write GeoJSON to file
    writeFileSync(fileName, JSON.stringify(geojson, null, 2));

  } catch (error) {
    console.error("Failed to fetch OSM data:", error);
    return "";
  }
};


let bb = '(37.305,-122.06,37.35,-121.87)';
let filename = 'src/assets/poi-geojson.json';
if (process.argv.length > 2 && process.argv[2].includes('test')) {
  console.log('fetching test data');
  bb = '(37.385,-122.0871,37.39,-122.0874)';
  filename = '__tests__/data/poi-geojson.json';
}
// simple shorthand is to assume all nodes with a name are points of interest.
const query = `[out:json];
(node[name][!bus]${bb};way[building][name]${bb};);
out center;`;
fetchOSMData(query, filename);
