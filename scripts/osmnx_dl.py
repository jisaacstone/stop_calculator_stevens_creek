from networkx.readwrite import node_link_data
import osmnx as ox
from osm2geojson import json2geojson
import json


def id(link):
    inorder = sorted((link['source'], link['target']))
    return f"{inorder[0]:x}-{inorder[1]:x}"


bb = [-122.05, 37.315, -121.9, 37.33]
poly = ox.utils_geo.bbox_to_poly(bb)
opn = list(ox._overpass._download_overpass_network(poly, network_type='walk', custom_filter=None))[0]
with open('nld.geojson', 'w') as fob:
    gj = json2geojson(opn)
    json.dump(gj, fob)

graph = ox.graph._create_graph([opn], True)
nld = node_link_data(graph)
nld['links'] = [{'osmid': l['osmid'], 's': l['source'], 't': l['target'], 'l': l['length'], 'id': id(l)} for l in nld['links']]
with open('src/assets/nld.json', 'w') as fob:
    json.dump(nld, fob)

crs = nld['graph']['crs']  # 4326
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
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [nodemap[link['s']], nodemap[link['t']]],
            },
            "properties": {
                'id': link['id'],
                'osmid': link['osmid']
            }
        })
with open('src/assets/sc-geojson.json', 'w') as fob:
    json.dump(gj, fob)
