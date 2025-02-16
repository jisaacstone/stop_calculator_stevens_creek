from networkx.readwrite import node_link_data
import osmnx as ox
from osm2geojson import json2geojson
import json


def id(link):
    return f"{link['source']:x}-{link['target']:x}"


bb = [-122.05, 37.315, -121.9, 37.33]
poly = ox.utils_geo.bbox_to_poly(bb)
opn = list(ox._overpass._download_overpass_network(poly, network_type='walk', custom_filter=None))[0]
with open('nld.geojson', 'w') as fob:
    gj = json2geojson(opn)
    json.dump(gj, fob)

graph = ox.graph._create_graph([opn], False)
nld = node_link_data(graph)
nld['links'] = [{'osmid': l['osmid'], 's': l['source'], 't': l['target'], 'l': l['length'], 'id': id(l)} for l in nld['links']]
with open('nld.json', 'w') as fob:
    json.dump(nld, fob)
