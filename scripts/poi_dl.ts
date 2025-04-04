import { JSDOM } from 'jsdom';
import { writeFileSync } from 'fs';
import osmtogeojson from "osmtogeojson";
import { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

export const fetchOSMData = async (query: string, fileName: string) => {
  try {
    console.log("Fetching OSM XML data...");
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    if (!response.ok) {
      throw new Error(`OSM API Error: ${response.statusText}`);
    }

    const xmlText = await response.text();

    const dom = new JSDOM(xmlText, { contentType: "text/xml" });
    const xmlDoc = dom.window.document;

    const geojson = osmtogeojson(xmlDoc);

    // Write GeoJSON to file
    writeFileSync(fileName, JSON.stringify(geojson, null, 2));

  } catch (error) {
    console.error("Failed to fetch OSM data:", error);
    return "";
  }
};


const bb = '(37.32,-122.06,37.34,-121.85)';
// simple shorthand is to assume all nodes with a name are points of interest.
const query = `(node[name][!bus]${bb};);out body;(way[building][name]${bb};);out center;`;
let filename = 'src/assets/poi-geojson.json';
if (process.argv.length > 2 && process.argv[3].includes('test')) {
  filename = '__test__/data/poi-geojson.json';
}
fetchOSMData(query, filename);
