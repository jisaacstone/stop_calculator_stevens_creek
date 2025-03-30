import { default as van, State } from 'vanjs-core';

export const journeyTime: State<number> = van.state(15);
export const selectedStopId: State<string> = van.state('');
export const busAreaKm2: State<string> = van.state('0.0');
export const brtAreaKm2: State<string> = van.state('0.0');
export const brtToBusRatio: State<string> = van.state('0');
