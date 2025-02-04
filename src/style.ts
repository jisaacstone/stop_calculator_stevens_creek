import {Fill, Stroke, Style, Circle} from 'ol/style.js';

export const outline = new Stroke({ color: [45, 45, 45, 0.5] });
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
export const circle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(175,255,210,0.8)'
        }),
    }),
})
