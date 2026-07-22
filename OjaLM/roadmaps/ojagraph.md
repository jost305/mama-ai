# OjaGraph Roadmap
**African Commerce Knowledge Graph**

OjaGraph is the structured database that stores relationships between products, vendors, brands, markets, and regional terminologies. It provides the ground truth that MamaPrice uses to inject context into OjaLM.

## Current Focus: v0.1 Schema Design
- [x] Define the universal **Knowledge Object** schema:
  - `ID`: Unique identifier
  - `Type`: (Product, Vendor, Price, Receipt, Image, Voice, Market, Scout, Route, City, State)
  - `Location`: Country, Region, Market, GPS coordinates
  - `Context`: Language, Timestamp
  - `Provenance`: Source, Trust Tier, Verification Status, License
  - `Relationships`: Graph edges (e.g., *sold_by*, *located_in*, *connected_by*, *covers*)
- [ ] Map the "Food & Groceries" domain into graph relationships (e.g., "Oloyin" -> *is_type_of* -> "Beans").
- [ ] Map Geospatial routing: Connect Markets to Transport Hubs via Routes.

## Future Milestones
### v0.5: Market Integration
- Mapping physical open markets in Nigeria (e.g., Bodija, Balogun, Mile 12) and their specialized supply chains.

### v1.0: Dynamic Pricing Nodes
- Integrating live price feeds and historical price trends directly into the knowledge graph.
