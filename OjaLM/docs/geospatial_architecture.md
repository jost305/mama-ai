# Geospatial Architecture

OjaGraph is no longer a flat list of products. It is a multidimensional graph connected by geospatial edges.

## Graph Topology
The graph connects:
- `Product` -> `sold_by` -> `Vendor`
- `Vendor` -> `located_in` -> `Market`
- `Market` -> `located_in` -> `LGA` -> `State` -> `Country`
- `Market` -> `connected_by (Route)` -> `Transport Hub`
- `Scout` -> `covers` -> `Market`

## Applications in MamaPrice
When the MamaPrice Agent is queried, it performs geospatial bounding box searches:
1. Identify User Location (GPS).
2. Fetch Markets within a 5km radius (`location_intelligence`).
3. Fetch Vendors in those Markets (`ojagraph`).
4. Fetch dynamic Price Observations from those Vendors (`mamapricescout`).
5. Run the routing optimization algorithm to balance cheapest price against travel time.
