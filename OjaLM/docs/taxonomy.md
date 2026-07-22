# Commerce Taxonomy v1.0

**Version:** 1.0.0
**Status:** Official
**Project:** OjaLM Research

This document defines the foundational **Commerce Taxonomy** for the entire Oja ecosystem. This taxonomy dictates the structure of our evaluation benchmarks (**OjaBench**), our training datasets (**OjaData**), our knowledge graphs (**OjaGraph**), and ultimately the APIs that power **MarketMama AI**.

OjaLM is an AI Commerce Operating System. It must understand *everything* people buy, sell, negotiate, and transport in African markets—not just food.

---

## 1. Product Domains (The "What")

These are the primary physical and digital product categories that OjaLM must comprehensively understand.

### 🛒 Food & Groceries
- Raw staples (Rice, beans, garri, yams)
- Fresh produce (Tomatoes, peppers, onions)
- Processed foods (Noodles, pasta, flour, sugar)
- Oils & Condiments (Palm oil, groundnut oil, seasoning cubes)
- Beverages (Milk, water, sodas, malt)

### 📱 Electronics
- Mobile Devices (Infinix, Tecno, Samsung, Apple)
- Accessories (Original vs. fake chargers, power banks, phone batteries)
- Home Appliances (Televisions, refrigerators, fans, generators)
- IT Equipment (Laptops, routers, storage)

### 👕 Fashion & Apparel
- Textiles (Ankara, Lace, Senator fabric, Adire)
- Footwear (Leather shoes, sneakers, sandals)
- Uniforms (School uniforms, security uniforms)
- Accessories (Bags, jewelry)

### 🧱 Construction & Building Materials
- Core Materials (Cement, blocks, sand, granite)
- Finishing (Paint, tiles, doors, windows)
- Roofing (Aluminum roofing sheets, wood)
- Systems (Plumbing materials, electrical wiring, PVC pipes)

### 🚗 Automotive & Transport
- Maintenance (Engine oil, brake pads, spark plugs)
- Parts (Tyres, car batteries, shock absorbers)
- Vehicles (Cars, tricycles/Keke, motorcycles/Okada parts)

### 💄 Beauty & Personal Care
- Haircare (Hair attachments, weaves, relaxers, shampoo)
- Skincare (Creams, lotions, soaps, shea butter)
- Cosmetics (Makeup, perfumes, body sprays)

### 💊 Healthcare & Pharmacy
- Over-the-Counter (Malaria drugs, painkillers, vitamins)
- Equipment (Thermometers, BP monitors)
- First-Aid (Bandages, antiseptics)

### 🐄 Agriculture & Farming
- Inputs (Fertilizer, seeds, herbicides, pesticides)
- Livestock (Animal feed, poultry vaccines)
- Equipment (Cutlasses, hoes, watering systems)

---

## 2. Intelligence Verticals (The "How")

These are the cognitive commerce skills OjaLM must possess across all Product Domains listed above.

### 🧠 Shopping Reasoning
- Planning budgets across multiple items.
- Optimizing a shopping list for a specific event (e.g., a wedding).
- Identifying missing complementary items.

### 🗺️ Market Intelligence
- Knowing which specific physical markets specialize in which goods (e.g., Alaba for electronics, Balogun for fabrics).
- Understanding seasonal availability and supply chain shocks.

### 🏪 Vendor Intelligence
- Differentiating between importers, wholesalers, distributors, and street retailers.
- Evaluating vendor trustworthiness and bulk-purchasing requirements.

### 🤝 Negotiation
- Understanding the cultural dance of bargaining.
- Identifying a fair "last price."
- Polite haggling in vernacular languages.

### 🧮 Commerce Mathematics
- Unit conversion (e.g., "paint buckets" to kilograms, "mudu" to cups).
- Calculating bulk discounts and wholesale margins.
- Estimating transport costs relative to purchase volume.

### 💰 Financial Reasoning
- Understanding payment methods (Cash, POS, Transfers, Escrow).
- Evaluating layaway, credit (Gbese), and installment plans.

### 🚚 Logistics & Delivery
- Routing goods from the market to the consumer.
- Determining appropriate transport types (Wheelbarrow/Barrow boy, Keke, Danfo, Truck) based on weight/volume.

### 🛠️ Tool Calling
- Knowing when to query external systems (MarketMama APIs) instead of guessing.
- Interacting with databases for live pricing, inventory checks, and vendor availability.

### 🗣️ Multilingual Commerce
- Translating commerce intent flawlessly across English, Nigerian Pidgin, Yoruba, Hausa, and Igbo.
- Maintaining the nuanced tone of street commerce in local dialects.

### 👁️ Vision Commerce (Future Phase)
- Analyzing receipts and handwritten shopping lists.
- Identifying fake vs. original product packaging via images.

### 🎤 Voice Commerce (Future Phase)
- Processing noisy, vernacular voice notes from buyers and sellers.

### 🛡️ Safety & Hallucination
- Admitting a lack of knowledge on live prices.
- Refusing to hallucinate non-existent substitute products.
- Flagging dangerous health/pharmacy queries to human professionals.

---

## Architecture Implementation

Every question in **OjaBench**, every row in **OjaData**, and every node in **OjaGraph** must be tagged with at least one **Product Domain** and one **Intelligence Vertical** from this taxonomy. 

*Example Tagging:* 
A question about bargaining for Ankara fabric in Pidgin would be tagged: 
`[Domain: Fashion & Apparel] + [Verticals: Negotiation, Multilingual Commerce]`
