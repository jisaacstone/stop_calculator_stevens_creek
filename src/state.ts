import { default as van, State } from 'vanjs-core';

export const journeyTime: State<number> = van.state(15);
export const alternatives: State<'early' | 'peak'> = van.state('peak');
