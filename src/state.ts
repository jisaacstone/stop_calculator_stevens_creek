import { default as van, State } from 'vanjs-core';

export const journeyTime: State<number> = van.state(10);
export const alternatives: State<'early' | 'peak'> = van.state('peak');
