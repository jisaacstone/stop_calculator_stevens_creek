from networkx.readwrite import node_link_data
import osmnx as ox
import json


def id(link):
    inorder = sorted((link['source'], link['target']))
    return f"{inorder[0]:x}-{inorder[1]:x}"


test = False  # Set to True to generate tests
bb = [-122.06, 37.29, -121.86, 37.35] # Manually identified from OpenStreetMaps

if test:
    bb = [-122.08741, 37.39, -122.08715, 37.385]
    nld_file = '__tests__/data/nld_test.ts' 
    gj_file = '__tests__/data/sc-geojson_test.ts'
else:
    nld_file = 'src/assets/nld.ts' 
    gj_file = 'src/assets/sc-geojson.ts'

poly = ox.utils_geo.bbox_to_poly(bb)

# Download street network for pedestrians (walk network)
graph = ox.graph_from_polygon(poly, network_type="walk", simplify=False)

nld = node_link_data(graph, edges="links")

# Add id 
for link in nld['links']:
    link['id'] = id(link)

#Every json file is a subset of ts
with open(nld_file, 'w') as fob:
    nld_json = json.dumps(nld, indent=2) 
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

with open(gj_file, 'w') as fob:
    gj_json = json.dumps(gj, indent=2)
    fob.write(f"const scGeojson = {gj_json};\nexport default scGeojson;")
