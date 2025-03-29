import {Fill, Stroke, Style, Circle} from 'ol/style.js';
import { METERS_PER_UNIT } from 'ol/proj/epsg4326.js'
import { COLORS } from './constants';

const getPixelMeters = (meters: number, resolution: number): number =>
  Math.max(meters / (resolution * METERS_PER_UNIT), 5);

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

export const walkArea = new Style({
  stroke: new Stroke({
    color: COLORS.GRAY,
    width: 1,
  }),
  fill: new Fill({ color: COLORS.PLUM }),
});
export const BRTArea = new Style({
  stroke: new Stroke({
    color: COLORS.GRAY,
    width: 1,
  }),
  fill: new Fill({ color: COLORS.LUMP }),
});

export const gridRoad = (meters: number, resolution: number) => {
  const meters_per_pixel = resolution * METERS_PER_UNIT;
  const pixel_meters = meters / meters_per_pixel;
  return new Style({
    stroke: new Stroke({
      color: COLORS.GRAY,
      width: Math.max(pixel_meters, 2)
    })
  });
};

export const circle = createCircleStyle;

export const selected = (
  meters: number,
  resolution: number
) => createCircleStyle(meters, resolution, COLORS.RED, COLORS.BLACK);
