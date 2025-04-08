import { default as van, State } from 'vanjs-core';

export const journeyTime: State<number> = van.state(15);
export const selectedStopId: State<string> = van.state('');
export const busAreaMi2: State<string> = van.state('0.0');
export const brtAreaMi2: State<string> = van.state('0.0');
export const brtToBusAreaRatio: State<string> = van.state('0');
export const brtToBusPoiRatio: State<string> = van.state('0');
export const busPoi: State<number> = van.state(0);
export const brtPoi: State<number> = van.state(0);
