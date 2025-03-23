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
  classArgs: object = {}
) => {
  return div(
    {class: "slider", ...classArgs},
    div({class: "label"}, display.name),
    input({
      type: "range",
      min: range.min,
      max: range.max,
      step: range.step,
      value: stateVar.val,
      oninput: e => {
        stateVar.val = e.target.value;
      },
    }),
    div(
      {class: "unitDisplay"},
      div(stateVar),
      div(display.units),
    )
  );
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
    {class: "select", oninput: e => stateVar.val = e.target.value},
    optionCollection
  )
  return sel
};

export const setupUi = (containerEl: HTMLElement) => {
  const journeyTimeSlider = makeInput(
    { name: 'time', units: 'min' },
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
  const areaEl = van.tags.div(
    {'className': 'area'},
    van.tags.div('during peak travel time you can access', van.tags.div(state.busAreaKm2, 'km²')),
    van.tags.div('with dedicated bus lanes it would increase to', van.tags.div(state.brtAreaKm2, 'km²')),
  );

  van.add(
    containerEl,
    journeyTimeSlider,
    busStopSelect,
    areaEl,
  );
  return {
    journeyTime: journeyTimeSlider,
    busStop: busStopSelect
  };
};
