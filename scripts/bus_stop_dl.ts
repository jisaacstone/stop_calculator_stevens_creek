import { JSDOM } from 'jsdom';
import { writeFileSync } from 'fs';
import osmtogeojson from "osmtogeojson";
import { FeatureCollection, Geometry, GeoJsonProperties } from "geojson";

export const fetchOSMData = async (query: string) => {
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

    // Parse relationships (bus routes & stop associations)
    const relations = parseRelations(xmlDoc);
    console.log("Parsed Route Relationships:", relations);

    linkStopsToRoutes(geojson, relations);

    // Write GeoJSON to file
    writeFileSync("./public/busstops-geojson.json", JSON.stringify(geojson, null, 2));

  } catch (error) {
    console.error("Failed to fetch OSM data:", error);
    return "";
  }
};

export const parseRelations = (xmlDoc: Document): Map<string, Set<string>> => {

  const nodeToRoutes = new Map<string, Set<string>>();

  // Process <relation> tags (bus routes)
  xmlDoc.querySelectorAll("relation").forEach((rel) => {
    const routeName = rel.querySelector("tag[k='ref']")?.getAttribute("v");
    if (!routeName) return;

    // Find all <member> tags where type="node" (bus stops)
    rel.querySelectorAll("member[type='node']").forEach((member) => {
      const nodeId = member.getAttribute("ref");
      if (!nodeId) return;

      if (member.getAttribute("role") === "stop") {
        if (!nodeToRoutes.has(nodeId)) {
          nodeToRoutes.set(nodeId, new Set());
        }
        nodeToRoutes.get(nodeId)?.add(routeName);
      };
    });
  });

  return nodeToRoutes;
};

// Step 2: Link Stops to Routes Using Parsed Relationships
const linkStopsToRoutes = (geojson: FeatureCollection<Geometry, GeoJsonProperties>, relations: Map<string, Set<string>>) => {
  geojson.features.forEach((feature) => {
    if (feature.properties) {
      const stopId = feature.properties.id.replace("node/", "");
      feature.properties.route = Array.from(relations.get(stopId) || []);
    }
  });
};

const bb = '(37.32,-122.06,37.34,-121.85)';
const query = `(rel[route=bus][network=VTA]${bb};node(r)${bb}[public_transport=stop_position];);out body;`;
fetchOSMData(query);
