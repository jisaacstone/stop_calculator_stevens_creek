import {Fill, Stroke, Style, Circle} from 'ol/style.js';

export const outline = new Stroke({ color: 'rgba(45, 45, 45, 0.1)' });
export const mainRoad = new Style({
  stroke: new Stroke({
    color: 'rgba(123,50,148, 0.5)',
    width: 3,
  })
});
export const road = new Style({
    stroke: new Stroke({
      color: 'rgba(194,165,207, 0.5)',
      width: 2,
  })
});
export const gridRoad = new Style({
    stroke: new Stroke({
    color: 'rgba(247,247,247, 0.5)',
    width: 1,
  })
});
export const circle = new Style({
    image: new Circle({
        radius: 3,
        fill: new Fill({
          color: 'rgba(166,219,160, 0.5)'
        }),
    }),
});
export const poi = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(0,136,55, 0.5)'
        }),
    }),
});
export const bldg = new Style({
    stroke: new Stroke({color: 'rgba(200, 100, 150, 0.5)'}),
    fill: new Fill({color: 'rgb(100, 200, 150)'
  })
});

export const selected = new Style({
    stroke: new Stroke({color: 'rgba(20, 220, 110, 0.5)'}),
    fill: new Fill({color: 'rgba(10, 200, 150, 1)'
  })
});

export const walk = new Style({
    stroke: new Stroke({color: 'rgba(123,50,148, 1)', width: 3}),
    fill: new Fill({color: 'rgba(10, 200, 150, 0.2)'})
});

export const walkEdge = new Style({
    stroke: new Stroke({color: 'rgba(0,136,55, 1)', width: 2}),
    fill: new Fill({color: 'rgba(10, 200, 150, 0.2)'})
});
