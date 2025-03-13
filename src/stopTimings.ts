/*
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

export const route523 = {
  // WB
  'node/6739935094': [{id: 'node/6712922775', costs: {'early': 3, 'peak': 7, 'BRT': 0}}],  // Montgomery -> Grand
  'node/6712922775': [{id: 'node/6712917182', costs: {'early': 2, 'peak': 6, 'BRT': 0}}],  // Grand -> Bascom
  'node/6712917182': [{id: 'node/6739935096', costs: {'early': 4, 'peak': 5, 'BRT': 0}}],  // Bascom -> Satanta Row
  'node/6739935096': [{id: 'node/6739935100', costs: {'early': 3, 'peak': 8, 'BRT': 0}}],  // Santana Row -> Cypress
  'node/6739935100': [{id: 'node/6739935102', costs: {'early': 2, 'peak': 3, 'BRT': 0}}],  // Cypress -> Keily (G)
  'node/6739935102': [{id: 'node/6739935108', costs: {'early': 3, 'peak': 4, 'BRT': 0}}],  // Keily (G) -> Cabot
  'node/6739935108': [{id: 'node/6732665922', costs: {'early': 2, 'peak': 3, 'BRT': 0}}],  // Cabot -> Stern
  'node/6732665922': [{id: 'node/6739935122', costs: {'early': 1, 'peak': 3, 'BRT': 0}}],  // Stern -> Wolf (D)
  'node/6739935122': [{id: 'node/6739935116', costs: {'early': 2, 'peak': 3, 'BRT': 0}}],  // Wolf (D) -> De Anza
  'node/6739935116': [{id: 'node/6710495366', costs: {'early': 1, 'peak': 2, 'BRT': 0}}],  // De Anza -> Stelling (E)
  // EB
  'node/6739935090': [{id: 'node/6739935144', costs: {'early': 1, 'peak': 2, 'BRT': 0}}],
  'node/6739935144': [{id: 'node/6739935110', costs: {'early': 2, 'peak': 3, 'BRT': 0}}],
  'node/6739935110': [{id: 'node/6732665924', costs: {'early': 1, 'peak': 3, 'BRT': 0}}],
  'node/6732665924': [{id: 'node/6739935106', costs: {'early': 2, 'peak': 3, 'BRT': 0}}],
  'node/6739935106': [{id: 'node/6739935104', costs: {'early': 3, 'peak': 4, 'BRT': 0}}],
  'node/6739935104': [{id: 'node/6712917178', costs: {'early': 2, 'peak': 3, 'BRT': 0}}],
  'node/6712917178': [{id: 'node/6739935098', costs: {'early': 3, 'peak': 8, 'BRT': 0}}],
  'node/6739935098': [{id: 'node/6712917181', costs: {'early': 4, 'peak': 5, 'BRT': 0}}],
  'node/6712917181': [{id: 'node/6712927093', costs: {'early': 2, 'peak': 6, 'BRT': 0}}],
  'node/6712927093': [{id: 'node/??????????', costs: {'early': 3, 'peak': 7, 'BRT': 0}}],
}
