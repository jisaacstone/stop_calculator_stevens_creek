## Partial Line in Walkshed

At the edge of the walkshed we have paths that are partially covered.
These should be split.

## Missing Data

Some roads are missing in the dataset the `osmnx_dl.py` script creates.
Most importantly are sections of Steven's Creek BLVD.

Could be part of the highway filter?

## Find Stops

Points evenly-spaced along Stevens Creek / West San Carlos that can act as bus stops.
need a nearest point calculator - to find the node in our graph closest to the selected stop location.

## Bus Stop dataset

Some new script to pull the locations of existing bus stops

## POI Dataset

Pull down features from OSM to act as destinations for our access analysis.

## Buffered walkshed - POI matching.

Match the walkshed calculation with the feature dataset - determine access
