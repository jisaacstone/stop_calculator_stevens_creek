from networkx.readwrite import node_link_data
import osmnx as ox
import json


def id(link):
    inorder = sorted((link['source'], link['target']))
    return f"{inorder[0]:x}-{inorder[1]:x}"


bb = [-122.05, 37.315, -121.9, 37.33]
poly = ox.utils_geo.bbox_to_poly(bb)
opn = list(ox._overpass._download_overpass_network(poly, network_type='walk', custom_filter=None))[0]

graph = ox.graph._create_graph([opn], True)
nld = node_link_data(graph)
nld['links'] = [{'osmid': l['osmid'], 's': l['source'], 't': l['target'], 'l': l['length'], 'id': id(l), 'n': l.get('name')} for l in nld['links']]
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
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [nodemap[link['s']], nodemap[link['t']]],
            },
            "properties": {
                'id': link['id'],
                'osmid': link['osmid']
            }
        }
        if link['n']:
            feature['properties']['name'] = link['n']
        features.append(feature)
with open('src/assets/sc-geojson.json', 'w') as fob:
    json.dump(gj, fob)
