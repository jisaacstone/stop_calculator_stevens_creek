from networkx.readwrite import node_link_data
from osmnx.simplification import simplify_graph
from pyproj import Geod
from shapely.geometry import Point, LineString
import json
import osmnx as ox


def id(link, n):
    inorder = sorted((link['source'], link['target']))
    return f"{inorder[0]:x}-{inorder[1]:x}-{n}"


test = False  # Set to True to generate tests
geod = Geod(ellps="WGS84")

if test:
    bb = [-122.08741, 37.39, -122.08715, 37.385]
    nld_file = '__tests__/data/nld_test.ts' 
    gj_file = '__tests__/data/sc-geojson_test.ts'
else:
    bb = [-122.06, 37.29, -121.86, 37.35] # Manually identified from OpenStreetMaps
    nld_file = 'src/assets/nld.ts' 
    gj_file = 'src/assets/sc-geojson.ts'

poly = ox.utils_geo.bbox_to_poly(bb)

# Download street network for pedestrians (walk network)
graph = ox.graph_from_polygon(poly, network_type="walk", simplify=False)
simple = simplify_graph(graph)

nld = node_link_data(simple, edges="links")
features = []
ids = set()
links = []

nodemap = {n['id']: [n['x'], n['y']] for n in nld['nodes']}

# Json Serializeable geometry, calcuated length
for n, link in enumerate(nld['links']):
    id_ = id(link, n)
    if id_ not in ids:
        ids.add(id_)
        if link.get('geometry'):
            geometry = link['geometry']
        else:
            geometry = LineString([
                Point(nodemap[link['source']]),
                Point(nodemap[link['target']])
            ])
        feature = {
            "geometry": {
                "type": geometry.geom_type,
                "coordinates": [list(c) for c in geometry.coords]
            },
            "type": "Feature",
            "properties": {
                'id': id_,
                'length_m': geod.geometry_length(geometry)
            }
        }
        if link.get('name'):
            feature['properties']['name'] = link['name']
        features.append(feature)
        links.append(dict(
            source=link['source'],
            target=link['target'],
            coords=feature['geometry']['coordinates'],
            **feature['properties']
        ))

#Every json file is a subset of ts
with open(nld_file, 'w') as fob:
    nld_json = json.dumps({'nodes': nld['nodes'], 'links': links}, indent=2) 
    fob.write(f"const nld = {nld_json};\nexport default nld;")

gj = {
    "type": "FeatureCollection",
    "features": features,
}
with open(gj_file, 'w') as fob:
    gj_json = json.dumps(gj, indent=2)
    fob.write(f"const scGeojson = {gj_json};\nexport default scGeojson;")
