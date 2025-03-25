export const COLORS = {
  BLACK: 'rgba(0, 0, 0, 1)',
  RED: 'rgba(255, 0, 0, 1)',
  GRAY: 'rgba(150, 150, 150, 1)',
  PURPLE: 'rgba(123, 50, 148, 1)',
  BLUE: 'rgba(10, 150, 200, 1)',
  PLUM: 'rgba(123, 50, 148, 0.5)',
  LUMP: 'rgba(168, 120, 148, 0.5)',
  ORANGE: 'rgba(220, 165, 0, 1)',
} as const;

export const WALKING_SPEED_MS = 1.33; // (m/s) = 5.8 km/h
export const SECONDS_PER_MINUTE = 60;
export const SQ_METER_IN_SQ_KM = 1_000_000;
