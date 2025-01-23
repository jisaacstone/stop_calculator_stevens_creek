import {Fill, Stroke, Style, Circle} from 'ol/style.js';
export const outline = new Stroke({ color: [45, 45, 45, 0.1] });
export const circle = new Style({
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(255,255,255,0.4)'
        }),
    }),
})
