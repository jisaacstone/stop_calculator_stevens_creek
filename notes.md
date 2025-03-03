# Study

[Draft Study](https://www.cupertino.gov/files/assets/city/v/2/departments/documents/public-works/transportation/new-folder/draft-stevens-creek-boulevard-corridor-vision-and-implementation-plan-121224.pdf)

* Transit Signal Priority

- reduced travel time by 14% on 523 and 12% on 23/51

* Dedicated transit lane

[line 523](https://www.vta.org/sites/default/files/images/2024-10/Line523_102824.jpg)

13 stops on the corridor

Existing Conditions - 39.4 minutes
transit lane - 29.3 minutes
center-running BRT - 27 minutes
grade separated - 20 minutes

# Other notes

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
