/*
1 "name": "West San Carlos Street & Bird Avenue","id": "node/6739935092",
1 "name": "West San Carlos Street & Montgomery Street","id": "node/6739935094",
2 "name": "West San Carlos Street & Grand Avenue","id": "node/6712927093",
2 "name": "West San Carlos Street & Meridian Avenue","id": "node/6712922775",
3 "name": "West San Carlos Street & North Bascom Avenue","id": "node/6712917182",
3 "name": "West San Carlos Street & South Bascom Avenue","id": "node/6712917181",
4 "name": "Stevens Creek Boulevard & Santana Row","id": "node/6739935096",
4 "name": "Stevens Creek Boulevard & Santana Row","id": "node/6739935098",
WINCHESTER MISSING
5 "name": "Stevens Creek Boulevard & Harold Avenue","id": "node/6712917178",
5 "name": "Stevens Creek Boulevard & San Tomas Expressway","id": "node/6739935100",
6 "name": "Stevens Creek Boulevard & Kiely Boulevard","id": "node/6739935102",
6 "name": "Stevens Creek Boulevard & Kiely Boulevard","id": "node/6739935104",
7 "name": "Stevens Creek Boulevard & Cabot Avenue","id": "node/6739935108",
7 "name": "Stevens Creek Boulevard & Loma Linda Drive","id": "node/6739935106",
8 "name": "Stevens Creek Boulevard & Junipero Serra Freeway","id": "node/6732665922",  MISSING
8 "name": "Stevens Creek Boulevard & Stern Avenue","id": "node/6732665924",
9 "name": "Stevens Creek Boulevard & Miller Avenue","id": "node/6739935110",
9 "name": "Stevens Creek Boulevard & Wolfe Road","id": "node/6739935112",
10"name": "Stevens Creek Boulevard & North De Anza Boulevard","id": "node/6739935116",
10"name": "Stevens Creek Boulevard & South De Anza Boulevard","id": "node/6739935114",
11"name": "North Stelling Road & Stevens Creek Boulevard","id": "node/6710495366",
11"name": "Stevens Creek Boulevard & South Stelling Road","id": "node/6739935090",
*/

//WB 6739935094->6712922775->6712917182->6739935096->6739935100->6739935102->6739935108->6732665922->6739935122->6739935116->6710495366
//EB 6739935090->6739935144->6739935110->6732665924->6739935106->6739935104->6712917178->6739935098->6712917181->6712927093

type Edge = {next: string, bus: number, brt: number, direction: string};

export const busGraph: Map<string, Edge> = new Map([
  // WB
  ['node/6697914451', {next: 'node/6739935094', brt: 3, bus: 7, direction: 'WB'}],  // Convention Center -> BO
  ['node/6739935094', {next: 'node/6712922775', brt: 3, bus: 7, direction: 'WB'}],  // Montgomery -> Grand
  ['node/6712922775', {next: 'node/6712917182', brt: 2, bus: 6, direction: 'WB'}],  // Grand -> Bascom
  ['node/6712917182', {next: 'node/6739935096', brt: 4, bus: 5, direction: 'WB'}],  // Bascom -> Satanta Row
  ['node/6739935096', {next: 'node/6739935100', brt: 3, bus: 8, direction: 'WB'}],  // Santana Row -> Cypress
  ['node/6739935100', {next: 'node/6739935102', brt: 2, bus: 3, direction: 'WB'}],  // Cypress -> Keily (G)
  ['node/6739935102', {next: 'node/6739935108', brt: 3, bus: 4, direction: 'WB'}],  // Keily (G) -> Cabot
  ['node/6739935108', {next: 'node/6732665922', brt: 2, bus: 3, direction: 'WB'}],  // Cabot -> Stern
  ['node/6732665922', {next: 'node/6739935112', brt: 1, bus: 3, direction: 'WB'}],  // Stern -> Wolf (D)
  ['node/6739935112', {next: 'node/6739935116', brt: 2, bus: 3, direction: 'WB'}],  // Wolf (D) -> De Anza
  ['node/6739935116', {next: 'node/6710495366', brt: 1, bus: 2, direction: 'WB'}],  // De Anza -> Stelling (E)
  // EB
  ['node/6739935090', {next: 'node/6739935144', brt: 1, bus: 2, direction: 'EB'}],
  ['node/6739935144', {next: 'node/6739935110', brt: 2, bus: 3, direction: 'EB'}],
  ['node/6739935110', {next: 'node/6732665924', brt: 1, bus: 3, direction: 'EB'}],
  ['node/6732665924', {next: 'node/6739935106', brt: 2, bus: 3, direction: 'EB'}],
  ['node/6739935106', {next: 'node/6739935104', brt: 3, bus: 4, direction: 'EB'}],
  ['node/6739935104', {next: 'node/6712917178', brt: 2, bus: 3, direction: 'EB'}],
  ['node/6712917178', {next: 'node/6739935098', brt: 3, bus: 8, direction: 'EB'}],
  ['node/6739935098', {next: 'node/6712917181', brt: 4, bus: 5, direction: 'EB'}],
  ['node/6712917181', {next: 'node/6712927093', brt: 2, bus: 6, direction: 'EB'}],
  ['node/6712927093', {next: 'node/6739935092', brt: 3, bus: 7, direction: 'EB'}],
  ['node/6739935092', {next: 'node/6697914453', brt: 3, bus: 7, direction: 'EB'}],
]);
