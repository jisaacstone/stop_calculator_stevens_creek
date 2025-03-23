import { default as van, State } from 'vanjs-core';

export const journeyTime: State<number> = van.state(10);
export const alternatives: State<'early' | 'peak'> = van.state('peak');
export const selectedStopId: State<string> = van.state('');
export const areaKm2: State<string> = van.state('');
