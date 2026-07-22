# Location Intelligence Standard

Location Intelligence is the geospatial reality of African commerce. It provides OjaLM and MamaPrice with an intrinsic understanding of the physical world.

## The Mandate
A commerce engine without geospatial awareness will tell a user in Lagos to buy rice from a vendor in Kano because it is ₦500 cheaper, completely ignoring the 1000km route and logistics cost. The Location Intelligence layer exists to prevent this hallucination.

## Entities
1. **Nodes:** Countries, States, LGAs, Cities, Markets, Hubs, Warehouses.
2. **Edges (Routes):** The physical path between two nodes, containing `distance`, `driving_time`, `traffic_score`, and `road_quality`.

## The Rule of Proximity
MamaPrice Agent must always calculate the `total_cost = price + (distance * transport_rate)` before presenting a recommendation to the user. Every market node must maintain `Latitude` and `Longitude` to enable haversine distance calculations.
