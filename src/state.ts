import { default as van, State } from 'vanjs-core';

export const journeyTime: State<number> = van.state(10);
export const alternatives: State<'early' | 'peak'> = van.state('peak');
export const selectedStopId: State<string> = van.state('');
export const area: State<number> = van.state(0);
