import {Fill, Stroke, Style, Circle} from 'ol/style.js';
import { METERS_PER_UNIT } from 'ol/proj/epsg4326.js'



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
export const gridRoad = (meters: number, resolution: number) => {
  const meters_per_pixel = resolution * METERS_PER_UNIT;
  const pixel_meters = meters / meters_per_pixel;
  return new Style({
    stroke: new Stroke({
      color: 'rgba(166,219,160, 1)',
      width: Math.max(pixel_meters, 2)
    })
  });
};

export const circle = (meters: number, resolution: number) => {
  const meters_per_pixel = resolution * METERS_PER_UNIT;
  const pixel_meters = meters / meters_per_pixel;
  return new Style({
    image: new Circle({
        //radius: Math.min(meters/resolution, 3),
        radius: Math.max(pixel_meters, 3),
        fill: new Fill({
          color: 'rgba(166,219,160, 0.9)'
        }),
    }),
  });
};

export const bldg = new Style({
    stroke: new Stroke({color: 'rgba(200, 100, 150, 0.5)'}),
    fill: new Fill({color: 'rgb(100, 200, 150)'
  })
});

export const selected = new Style({
    stroke: new Stroke({color: 'rgba(20, 220, 110, 0.5)', width: 3}),
    fill: new Fill({color: 'rgba(10, 200, 150, 1)'}),
    image: new Circle({
        radius: 5,
        fill: new Fill({
            color: 'rgba(0,136,55, 0.5)'
        }),
    }),
});

export const walk = new Style({
    stroke: new Stroke({color: 'rgba(123,50,148, 1)', width: 3}),
    fill: new Fill({color: 'rgba(10, 200, 150, 0.2)'})
});

export const walkEdge = new Style({
    stroke: new Stroke({color: 'rgba(0,136,55, 1)', width: 2}),
    fill: new Fill({color: 'rgba(10, 200, 150, 0.2)'})
});
