import { State } from 'vanjs-core';
import van from 'vanjs-core';
import * as state from 'state';
import * as stopTimings from 'stopTimings';
import busStopSource from 'assets/busstops-geojson.json';

const { div, input, select, option } = van.tags;

const makeInput = (
  display: {name: string, units: string},
  range: {min: number, max: number, step: number},
  stateVar: State<number>,
) => {
  const slider = input({
    type: "range",
    min: range.min,
    max: range.max,
    step: range.step,
    value: stateVar.val,
    oninput: e => {
      stateVar.val = e.target.value;
    },
  });
  return {
    input: slider,
    divs: [
      div({class: "label"}, display.name),
      slider,
      div(stateVar),
      div(display.units),
    ]
  };
};

const makeSelect = <Typ extends string>(
  stateVar: State<Typ>,
  options: Typ[],
  names?: string[],
) => {
  const optionCollection: HTMLOptionElement[] = [];
  for (let i = 0; i < options.length; i++) {
    const name = names ? names[i] : options[i];
    optionCollection.push(option({value: options[i], selected: () => stateVar.val === options[i]}, name));
  }
  const sel = select(
    {oninput: e => stateVar.val = e.target.value},
    optionCollection
  )
  return {input: sel, divs: [div('From the 523 stop at'), sel]};
};

export const setupUi = (containerEl: HTMLElement) => {
  const journeyTimeSlider = makeInput(
    { name: 'in', units: 'minutes' },
    { min: 5, max: 30, step: 5 },
    state.journeyTime,
  );
  const stopNames: string[] = [];
  const stopIds: string[] = [];
  stopTimings.alternatives.bus.forEach((v, k) => {
    const feature = busStopSource.features.find(f => f['id'] === k);
    if (feature && feature.properties.name) {
      stopIds.push(k);
      stopNames.push(`${v.direction} ${feature.properties.name}`);
    }
  });
  const busStopSelect = makeSelect(
    state.selectedStopId,
    stopIds,
    stopNames
  );
  const areaEls = [
    div('you can access'),
    div(state.busAreaKm2, 'km².'),
    div({class: 'dedicated'}, 'With dedicated bus lanes'),
    div({class: 'dedicated'}, 'it would increase to'),
    div({class: 'dedicated'}, state.brtAreaKm2, 'km².'),
  ];

  van.add(
    containerEl,
    ...busStopSelect.divs,
    ...journeyTimeSlider.divs,
    ...areaEls,
  );
  return {
    journeyTime: journeyTimeSlider.input,
    busStop: busStopSelect.input
  };
};
