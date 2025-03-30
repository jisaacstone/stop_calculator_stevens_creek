import { default as van, State } from 'vanjs-core';

export const journeyTime: State<number> = van.state(10);
export const selectedStopId: State<string> = van.state('');
export const busAreaKm2: State<string> = van.state('');
export const brtAreaKm2: State<string> = van.state('');
export const brtToBusRatio: State<string> = van.state('');
