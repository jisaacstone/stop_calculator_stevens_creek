import {Fill, Stroke, Style, Circle} from 'ol/style.js';

export const outline = new Stroke({ color: [45, 45, 45, 0.1] });
export const mainRoad = new Style({
  stroke: new Stroke({
    color: [208, 137, 130, 0.9],
    width: 3,
  })
});
export const road = new Style({
  stroke: new Stroke({
    color: [218, 167, 130, 0.9],
    width: 2,
  })
});
export const gridRoad = new Style({
  stroke: new Stroke({
    color: [167, 219, 190, 0.5],
    width: 1,
  })
});
export const circle = new Style({
    image: new Circle({
        radius: 3,
        fill: new Fill({
            color: 'rgba(175,255,210,0.8)'
        }),
    }),
})
export const poi = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: [145, 199, 100, 0.9]
        }),
    }),
})
export const bldg = new Style({
  stroke: new Stroke({color: [200, 100, 150, 0.5]}),
  fill: new Fill({color: [100, 200, 150, 0.2]})
})
