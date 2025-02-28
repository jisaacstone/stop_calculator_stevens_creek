from networkx.readwrite import node_link_data
import osmnx as ox
import json


def id(link):
    inorder = sorted((link['source'], link['target']))
    return f"{inorder[0]:x}-{inorder[1]:x}"


# Manually identified from OpenStreetMaps
bb = [-122.05, 37.315, -121.9, 37.33]
poly = ox.utils_geo.bbox_to_poly(bb)

# Download street network for pedestrians (walk network)
graph = ox.graph_from_polygon(poly, network_type="walk", simplify=False)

nld = node_link_data(graph, edges="links")

# Add id 
for link in nld['links']:
    link['id'] = id(link)

#Every json file is a subset of ts
with open('src/assets/nld.ts', 'w') as fob:
    nld_json = json.dumps(nld)
    fob.write(f"const nld = {nld_json};\nexport default nld;")

nodemap = {n['id']: [n['x'], n['y']] for n in nld['nodes']}

features = []
ids = set()
gj = {
    "type": "FeatureCollection",
    "features": features,
}

for link in nld['links']:
    if link['id'] not in ids:
        ids.add(link['id'])
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [nodemap[link['source']], nodemap[link['target']]],
            },
            "properties": {
                'id': link['id'],
                'osmid': link['osmid']
            }
        }
        if link.get('name'):
            feature['properties']['name'] = link['name']
        features.append(feature)

with open('src/assets/sc-geojson.ts', 'w') as fob:
    gj_json = json.dumps(gj)
    fob.write(f"const scGeojson = {gj_json};\nexport default scGeojson;")
