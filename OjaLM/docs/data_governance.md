# Oja AI Research Data Governance

**Version:** 1.0
**Project:** OjaLM Research
**Maintained by:** Oja AI Research Lab

This document defines the strict governance rules for any data entering the African Commerce Intelligence Benchmark (ACIB) or the OjaData training corpus. Quality data is the primary differentiator for OjaLM; therefore, data hygiene and legal compliance are paramount.

---

## 1. What Data is Allowed?
To build a culturally accurate and legally sound foundation model, we accept:
- **Public Datasets:** Open-source, permissive commercial data.
- **Vendor-Contributed Data:** Pricing, product descriptions, and availability provided voluntarily by vendors via the MarketMama platform.
- **User-Contributed Data:** Anonymized search queries, anonymized negotiation transcripts, and feedback provided explicitly for research.
- **Synthetic Data:** Culturally accurate commerce scenarios generated via LLMs, provided they are strictly vetted against hallucination.
- **Licensed Datasets:** Data purchased or licensed with clear commercial usage rights.

---

## 2. What Data is Forbidden?
OjaLM will absolutely NOT train on or benchmark against:
- **Copyrighted Material:** Published books, academic papers without permissive licenses, or proprietary datasets.
- **Private Conversations:** Private WhatsApp, Telegram, or SMS conversations without explicit opt-in consent.
- **Personally Identifiable Information (PII):** Phone numbers, full names, home addresses, or personal bank details.
- **Confidential Invoices:** Real-world receipts or invoices that have not been fully anonymized.
- **Sensitive Financial Information:** Private credit histories or proprietary financial algorithms.

---

## 3. Annotation Guidelines

When human experts or LLM judges annotate ACIB or OjaData entries, the following rules apply:

- **Completeness:** An answer is considered complete only if it addresses the user's implicit constraints (e.g., budget, location, health) alongside the explicit question.
- **Negotiation Quality:** A high-quality negotiation response must be polite, culturally appropriate, use accurate vernacular nuances, and protect the vendor's reasonable margin.
- **Multilingual Translation:** Variants should NOT be literal textbook translations. They must capture the *intent* and street-level tone of the market (e.g., translating "Which rice do you recommend?" to "Which rice sweet pass?").
- **Slang Preservation:** Code-switching and market slang must be preserved. Do not sterilize the data into formal English.

---

## 4. Dataset Quality Rules

Every single benchmark item in ACIB MUST have:
1. **One Canonical Answer:** A clear, ground-truth outcome that must be achieved.
2. **Acceptable Variations:** Multiple acceptable reasoning paths where appropriate.
3. **Peer Review:** At least one human reviewer validation.
4. **Version History:** Tracked via Git.
5. **Source Attribution:** Cited in the `sources` field of the schema if derived from a specific external reference.

---

## 5. Licensing

To ensure clarity for contributors, developers, and researchers:
- **ACIB (The Benchmark):** Released under **CC-BY-4.0** to encourage academic and industry adoption.
- **OjaData (The Training Corpus):** Released under a dual-license model. Open subset for research; proprietary subset for MarketMama AI.
- **OjaLM (The Model Weights):** Released under an OpenRAIL or permissive Apache 2.0 license (depending on base model inheritance constraints).
- **External Contributions:** All external researchers submitting to OjaBench or OjaData must agree to a Contributor License Agreement (CLA) ensuring they own the rights to the data they submit.
