1857
371.4 feet, 113.2m

block size of downtown Santa Clara

37.32354496572107, -121.91145887722482
37.322894002094145, -122.05560231287379

1° of latitude = always 111.32 km

block size of
.001 degrees (111.32 meter)

buildings:
  select:
    - building
  where: building IS NOT NULL
road:
    types:
        - lines
    select:
        - highway
        - name
        - layer
        - width
        - lanes
        - surface
        - smoothness
        - motorcycle
        - oneway
        - ref
        - source
    where: highway IN ('motorway','trunk','primary','secondary','tertiary','service','residential','pedestrian','path','living_street','track')
