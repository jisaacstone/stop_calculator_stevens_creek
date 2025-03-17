import {Fill, Stroke, Style, Circle} from 'ol/style.js';
import { METERS_PER_UNIT } from 'ol/proj/epsg4326.js'

const COLORS = {
  BLACK: 'rgba(0, 0, 0, 1)',
  RED: 'rgba(255, 0, 0, 1)',
  GRAY: 'rgba(150, 150, 150, 1)',
  PURPLE: 'rgba(123, 50, 148, 1)',
  BLUE: 'rgba(10, 150, 200, 1)',
  PLUM: 'rgba(123, 50, 148, 0.5)',
  ORANGE: 'rgba(220, 165, 0, 1)',
} as const;

const getPixelMeters = (meters: number, resolution: number): number =>
  Math.max(meters / (resolution * METERS_PER_UNIT), 2);

const createCircleStyle = (
  meters: number,
  resolution: number,
  fillColor: string = COLORS.ORANGE,
  strokeColor: string = COLORS.BLACK
): Style => 
  new Style({
    image: new Circle({
      radius: getPixelMeters(meters, resolution),
      stroke: new Stroke({ color: strokeColor, width: 1 }),
      fill: new Fill({ color: fillColor }),
    }),
  });

export const road = new Style({
    stroke: new Stroke({
      color: COLORS.GRAY,
      width: 2,
  })
});
export const gridRoad = (meters: number, resolution: number) => {
  const meters_per_pixel = resolution * METERS_PER_UNIT;
  const pixel_meters = meters / meters_per_pixel;
  return new Style({
    stroke: new Stroke({
      color: COLORS.BLUE,
      width: Math.max(pixel_meters, 2)
    })
  });
};

export const circle = (
  meters: number, 
  resolution: number
) => createCircleStyle(meters, resolution, COLORS.ORANGE, COLORS.BLACK);

export const selected = (
  meters: number, 
  resolution: number
) => createCircleStyle(meters, resolution, COLORS.RED, COLORS.BLACK);