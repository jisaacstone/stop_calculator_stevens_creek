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

type Edge = { id: string, cost: number };
type EdgeMap = {cross: Edge, next?: Edge};
const toCross = 1;  // how long does it take to cross Stevens Creek Blvd?

const earlyBus: Map<string, EdgeMap> = new Map([
  // WB
  ['node/6739935094', {cross: {id: 'node/6739935092', cost: toCross}, next: {id: 'node/6712922775', cost: 3}}],  // Montgomery -> Grand
  ['node/6712922775', {cross: {id: 'node/6712927093', cost: toCross}, next: {id: 'node/6712917182', cost: 2}}],  // Grand -> Bascom
  ['node/6712917182', {cross: {id: 'node/6712917181', cost: toCross}, next: {id: 'node/6739935096', cost: 4}}],  // Bascom -> Satanta Row
  ['node/6739935096', {cross: {id: 'node/6739935098', cost: toCross}, next: {id: 'node/6739935100', cost: 3}}],  // Santana Row -> Cypress
  ['node/6739935100', {cross: {id: 'node/6712917178', cost: toCross}, next: {id: 'node/6739935102', cost: 2}}],  // Cypress -> Keily (G)
  ['node/6739935102', {cross: {id: 'node/6739935104', cost: toCross}, next: {id: 'node/6739935108', cost: 3}}],  // Keily (G) -> Cabot
  ['node/6739935108', {cross: {id: 'node/6739935106', cost: toCross}, next: {id: 'node/6732665922', cost: 2}}],  // Cabot -> Stern
  ['node/6732665922', {cross: {id: 'node/6732665924', cost: toCross}, next: {id: 'node/6739935112', cost: 1}}],  // Stern -> Wolf (D)
  ['node/6739935112', {cross: {id: 'node/6739935110', cost: toCross}, next: {id: 'node/6739935116', cost: 2}}],  // Wolf (D) -> De Anza
  ['node/6739935116', {cross: {id: 'node/6739935114', cost: toCross}, next: {id: 'node/6710495366', cost: 1}}],  // De Anza -> Stelling (E)
  ['node/6710495366', {cross: {id: 'node/6739935090', cost: toCross}}],
  // EB
  ['node/6739935090', {cross: {id: 'node/6710495366', cost: toCross}, next: {id: 'node/6739935144', cost: 1}}],
  ['node/6739935144', {cross: {id: 'node/6739935116', cost: toCross}, next: {id: 'node/6739935110', cost: 2}}],
  ['node/6739935110', {cross: {id: 'node/6739935112', cost: toCross}, next: {id: 'node/6732665924', cost: 1}}],
  ['node/6732665924', {cross: {id: 'node/6732665922', cost: toCross}, next: {id: 'node/6739935106', cost: 2}}],
  ['node/6739935106', {cross: {id: 'node/6739935108', cost: toCross}, next: {id: 'node/6739935104', cost: 3}}],
  ['node/6739935104', {cross: {id: 'node/6739935102', cost: toCross}, next: {id: 'node/6712917178', cost: 2}}],
  ['node/6712917178', {cross: {id: 'node/6739935100', cost: toCross}, next: {id: 'node/6739935098', cost: 3}}],
  ['node/6739935098', {cross: {id: 'node/6739935096', cost: toCross}, next: {id: 'node/6712917181', cost: 4}}],
  ['node/6712917181', {cross: {id: 'node/6712917182', cost: toCross}, next: {id: 'node/6712927093', cost: 2}}],
  ['node/6712927093', {cross: {id: 'node/6712922775', cost: toCross}, next: {id: 'node/6739935092', cost: 3}}],
  ['node/6739935092', {cross: {id: 'node/6739935094', cost: toCross}}],
]);
const peakBus = new Map([
  // WB
  ['node/6739935094', {cross: {id: 'node/6739935092', cost: toCross}, next: {id: 'node/6712922775', cost: 7}}],  // Montgomery -> Grand
  ['node/6712922775', {cross: {id: 'node/6712927093', cost: toCross}, next: {id: 'node/6712917182', cost: 6}}],  // Grand -> Bascom
  ['node/6712917182', {cross: {id: 'node/6712917181', cost: toCross}, next: {id: 'node/6739935096', cost: 5}}],  // Bascom -> Satanta Row
  ['node/6739935096', {cross: {id: 'node/6739935098', cost: toCross}, next: {id: 'node/6739935100', cost: 8}}],  // Santana Row -> Cypress
  ['node/6739935100', {cross: {id: 'node/6712917178', cost: toCross}, next: {id: 'node/6739935102', cost: 3}}],  // Cypress -> Keily (G)
  ['node/6739935102', {cross: {id: 'node/6739935104', cost: toCross}, next: {id: 'node/6739935108', cost: 4}}],  // Keily (G) -> Cabot
  ['node/6739935108', {cross: {id: 'node/6739935106', cost: toCross}, next: {id: 'node/6732665922', cost: 3}}],  // Cabot -> Stern
  ['node/6732665922', {cross: {id: 'node/6732665924', cost: toCross}, next: {id: 'node/6739935112', cost: 3}}],  // Stern -> Wolf (D)
  ['node/6739935112', {cross: {id: 'node/6739935110', cost: toCross}, next: {id: 'node/6739935116', cost: 3}}],  // Wolf (D) -> De Anza
  ['node/6739935116', {cross: {id: 'node/6739935114', cost: toCross}, next: {id: 'node/6710495366', cost: 2}}],  // De Anza -> Stelling (E)
  ['node/6710495366', {cross: {id: 'node/6739935090', cost: toCross}}],
  // EB
  ['node/6739935090', {cross: {id: 'node/6710495366', cost: toCross}, next: {id: 'node/6739935144', cost: 2}}],
  ['node/6739935144', {cross: {id: 'node/6739935116', cost: toCross}, next: {id: 'node/6739935110', cost: 3}}],
  ['node/6739935110', {cross: {id: 'node/6739935112', cost: toCross}, next: {id: 'node/6732665924', cost: 3}}],
  ['node/6732665924', {cross: {id: 'node/6732665922', cost: toCross}, next: {id: 'node/6739935106', cost: 3}}],
  ['node/6739935106', {cross: {id: 'node/6739935108', cost: toCross}, next: {id: 'node/6739935104', cost: 4}}],
  ['node/6739935104', {cross: {id: 'node/6739935102', cost: toCross}, next: {id: 'node/6712917178', cost: 3}}],
  ['node/6712917178', {cross: {id: 'node/6739935100', cost: toCross}, next: {id: 'node/6739935098', cost: 8}}],
  ['node/6739935098', {cross: {id: 'node/6739935096', cost: toCross}, next: {id: 'node/6712917181', cost: 5}}],
  ['node/6712917181', {cross: {id: 'node/6712917182', cost: toCross}, next: {id: 'node/6712927093', cost: 6}}],
  ['node/6712927093', {cross: {id: 'node/6712922775', cost: toCross}, next: {id: 'node/6739935092', cost: 7}}],
  ['node/6739935092', {cross: {id: 'node/6739935094', cost: toCross}}],
]);

export const alternatives = {
  early: earlyBus,
  peak: peakBus
} as const;
