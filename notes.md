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

# 523 stops and speed

https://www.vta.org/sites/default/files/route_schedule_pdfs/current/route_523/route_523_schedule.pdf
[real time data](https://rt--cal-itp-data-analyses.netlify.app/district_04-oakland/21__01_new_speedmaps__district_04-oakland__organization_source_record_id_recc5ct95eufmqcxr)

Convention Center
SC & Barack Obama
Race/Meridian
SC & Bascom
Santana Row
SC & Winchester
Cypress
SC & Kiely
Lawrance
Stern
SC & Miller(Wolf)
De Anza
SC & Stelling

nodes:
    <member type="node" ref="7387164538" role="stop"/>
    <member type="node" ref="1115349352" role="stop"/>
    <member type="node" ref="6712927199" role="stop"/>
    <member type="node" ref="6703688695" role="stop"/>
    <member type="node" ref="6703688696" role="stop"/>
    <member type="node" ref="6703688699" role="stop"/>
    <member type="node" ref="6692646100" role="stop"/>
    <member type="node" ref="6692646102" role="stop"/>
    <member type="node" ref="6697914451" role="stop"/>
    <member type="node" ref="6739935094" role="stop"/>
    <member type="node" ref="6712922775" role="stop"/>
    <member type="node" ref="6712917182" role="stop"/>
    <member type="node" ref="6739935096" role="stop"/>
    <member type="node" ref="6739935100" role="stop"/>
    <member type="node" ref="6739935102" role="stop"/>
    <member type="node" ref="6739935108" role="stop"/>
    <member type="node" ref="6739935112" role="stop"/>
    <member type="node" ref="6739935116" role="stop"/>
    <member type="node" ref="6710495366" role="stop"/>
    <member type="node" ref="6831091493" role="stop"/>
    <member type="node" ref="6821811984" role="stop"/>
    <member type="node" ref="6708876873" role="stop"/>
    <member type="node" ref="6828431491" role="stop"/>
    <member type="node" ref="6841902116" role="stop"/>
    <member type="node" ref="6841902115" role="stop"/>
    <member type="node" ref="11113389737" role="stop"/>
    <member type="node" ref="6841902108" role="stop"/>
    <member type="node" ref="6695684854" role="stop"/>
    <member type="node" ref="10268977662" role="stop"/>

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
