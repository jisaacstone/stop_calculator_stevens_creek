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
  for (let i=0; i<options.length; i++) {
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
  const transitAlternativeSelect = makeSelect(
    state.alternatives,
    ['early', 'peak'],
  );
  const stopNames: string[] = [];
  const stopIds: string[] = [];
  stopTimings.alternatives.early.forEach((_, k) => {
    const feature = busStopSource.features.find(f => f['id'] === k);
    if (feature && feature.properties.name) {
      stopIds.push(k);
      stopNames.push(feature.properties.name);
    }
  });
  const busStopSelect = makeSelect(
    state.selectedStopId,
    stopIds,
    stopNames
  );
  van.add(
    containerEl,
    journeyTimeSlider,
    transitAlternativeSelect,
    busStopSelect
  );
  return {
    journeyTime: journeyTimeSlider,
    transitAlternative: transitAlternativeSelect,
    busStop: busStopSelect
  };
};
