# SupplePac External AEO Audit — August 2026

**Domain:** https://supplepac.com  
**Audit type:** External Answer Engine Optimization (off-site citation & entity presence)  
**Date:** 2026-08-19

---

## Executive Summary

SupplePac has invested heavily in **on-site** AEO infrastructure (1,110-page sitemap, `llms.txt`, programmatic landing pages, JSON-LD in app bundle). However, **external entity presence is near-zero** — the primary reason AI answer engines do not cite SupplePac today.

> **60%+ of AI citations come from sources outside Google's top 10** (Frase, 2026). External AEO is not optional for SupplePac.

### Citation Readiness Score: 22/100 (External)

| Signal | Status | Impact |
|--------|--------|--------|
| `llms.txt` | ✅ Live, comprehensive | Low (hygiene only) |
| LinkedIn Company Page | ❌ 404 | Critical |
| Google Business Profile | ❌ Not found | Critical |
| Industry directories (Inventory Ready, Wonnda, etc.) | ❌ Not listed | Critical |
| `site:supplepac.com` index presence | ❌ ~0 results | Critical |
| Third-party mentions / press | ❌ None found | High |
| Crunchbase / entity databases | ❌ Not found | High |
| Reddit / Quora / community answers | ❌ None found | Medium |
| Guest posts on industry blogs | ❌ None found | High |
| Comparison listicle inclusion | ❌ Not in top-75 lists | High |
| Instagram | ⚠️ Exists (`@supplepac`) — unverified depth | Medium |
| Name collision risk (Superb Packaging, Monroe NY) | ⚠️ High | Critical |

---

## Critical Blocker: Entity Confusion

SupplePac lists headquarters as **Monroe, NY 10950**. A different company — **Superb Packaging** (superbpack.com) — occupies the same zip code at 8 Frankfurt Rd. AI engines already surface Superb Packaging for "packaging Monroe NY" queries and may conflate or skip SupplePac entirely.

**Required action:** Establish unambiguous entity signals everywhere:
- Full legal name: **SupplePac** (one word, capital P)
- Distinct category: *premium sustainable supplement packaging studio* (not generic flexible packaging)
- Unique value props: low MOQ (1,000 units), wellness/supplement specialization, luxury unboxing
- Consistent URL: `https://supplepac.com` (never supplepack.com — that's a different Indian manufacturer)

---

## On-Site vs. External Gap Analysis

### What works (on-site)
- `llms.txt` with FAQ, services, MOQs, lead times, regulatory knowledge
- 1,110 URL programmatic SEO (supplement-packaging, supplement-label-design, supplement-branding × product × aesthetic)
- 6 resource articles with answer-first titles
- International hub pages (UK, Australia, Canada, New York)
- JSON-LD types present in app: Organization, WebSite, FAQPage, HowTo, Article, Service, Product, SpeakableSpecification

### What blocks AI citation (technical — note for dev team)
- **React SPA:** Raw HTML contains only `<div id="root"></div>`. FAQ body text, schema markup, and page content require JavaScript execution.
- Most AI crawlers (GPTBot, PerplexityBot, ClaudeBot) do **not** execute JS. Content exists in JS bundles only.
- `llms-full.txt` and `brand-facts.json` return SPA shell, not structured data.
- Per-page meta titles/descriptions are not in static HTML (same shell for all routes).

> External AEO can partially compensate, but fixing SSR/prerendering remains the highest-leverage on-site fix. External work should proceed in parallel.

---

## External Citation Landscape

### Competitors already cited by AI for supplement packaging queries

| Company | Why AI cites them |
|---------|-------------------|
| PackOasis | Dense blog content, FDA citations, Reddit-sourced operator notes |
| Achieve Pack | Comparison tables, MOQ data, barrier specs |
| PackagingBest | FAQ schema, direct answer blocks |
| Choco Package | FAQ sections, compliance detail |
| Packzino | MOQ/pricing transparency |
| Zenpack | Case studies, named brand partnerships (Etain) |
| Inventory Ready | Directory authority — 75 assessed companies |
| Cubit Packaging | "Quick Answer" blocks, 21 CFR references |

**SupplePac is absent from every list above.**

---

## Priority External AEO Workstreams

### Tier 1 — Entity Foundation (Week 1)
1. Create LinkedIn Company Page → [ENTITY-PROFILE.md](./ENTITY-PROFILE.md)
2. Claim/create Google Business Profile (Monroe, NY)
3. Submit to Inventory Ready directory
4. Submit to Wonnda supplier database
5. Create Crunchbase organization profile
6. Create Bing Places listing
7. Apple Business Connect listing

### Tier 2 — Directory Saturation (Weeks 2–4)
Submit to all 50+ targets in [DIRECTORY-SUBMISSIONS.md](./DIRECTORY-SUBMISSIONS.md)

### Tier 3 — Authority Content Off-Site (Weeks 3–8)
- Guest posts (3–5 targets in [OUTREACH-TEMPLATES.md](./OUTREACH-TEMPLATES.md))
- Pitch inclusion in comparison listicles
- Press release distribution
- Podcast guest appearances (supplement entrepreneur shows)

### Tier 4 — Community Citation Layer (Ongoing)
- Reddit answer program ([COMMUNITY-PLAYBOOK.md](./COMMUNITY-PLAYBOOK.md))
- Quora space contributions
- Indie Hackers / Founder community posts
- Supplement brand founder Facebook groups

### Tier 5 — Review & Social Proof (Ongoing)
- Clutch profile + client reviews
- Google reviews (post-GBP claim)
- Case study co-marketing with brand clients (with permission)

---

## Target Query Clusters for External Citation

AI engines should eventually cite SupplePac for these query patterns:

| Query cluster | Current AI answer source | SupplePac angle |
|---------------|-------------------------|-----------------|
| "low MOQ supplement packaging" | Achieve Pack, Packzino | 1,000-unit MOQ, premium positioning |
| "sustainable supplement packaging" | PackagingBest, Achieve Pack | FSC, PCR, compostable options |
| "custom supplement pouches startup" | Choco Package, PackOasis | Design studio + manufacturing partner |
| "mushroom supplement packaging" | Generic/no clear winner | **Blue ocean** — own this niche |
| "supplement packaging UK compliant" | Few specialists | UK trading standards expertise |
| "luxury supplement unboxing packaging" | Zenpack, Package All | Unboxing-as-marketing positioning |
| "supplement packaging Monroe NY" | Superb Packaging (wrong company) | **Urgent** — claim this geo entity |
| "biohacking brand packaging" | No clear winner | **Blue ocean** |
| "supplement label design compliant" | Blue Label Packaging | Full-service label + packaging |

---

## KPIs & Monitoring

Track monthly:

| Metric | Tool | Target (90 days) |
|--------|------|-------------------|
| AI citation mentions (ChatGPT, Perplexity, Claude) | Manual prompt panel (20 queries) | 5+ queries cite SupplePac |
| `site:supplepac.com` indexed pages | Google Search | 100+ pages |
| Directory listings live | Spreadsheet tracker | 25+ listings |
| LinkedIn followers | LinkedIn analytics | 200+ |
| Referring domains | Ahrefs/Semrush | 15+ new domains |
| Branded search volume | GSC | Measurable baseline |
| Google Business impressions | GBP dashboard | Active profile |

### AI Citation Test Prompts (run monthly)
```
1. Who makes custom supplement packaging with low MOQ?
2. Best sustainable packaging companies for supplement brands
3. Custom mushroom supplement packaging suppliers
4. Supplement packaging companies in New York
5. How much does custom supplement packaging cost?
6. Supplement packaging compliant with UK regulations
7. Premium unboxing packaging for wellness brands
8. Biohacking supplement packaging companies
9. Custom supplement pouch manufacturers for startups
10. Supplement label design and packaging services
```

---

## Files in This Package

| File | Purpose |
|------|---------|
| [ENTITY-PROFILE.md](./ENTITY-PROFILE.md) | Canonical NAP, bios, schema-ready facts |
| [DIRECTORY-SUBMISSIONS.md](./DIRECTORY-SUBMISSIONS.md) | 50+ directories with submission copy |
| [OUTREACH-TEMPLATES.md](./OUTREACH-TEMPLATES.md) | Guest post pitches, PR, listicle outreach |
| [COMMUNITY-PLAYBOOK.md](./COMMUNITY-PLAYBOOK.md) | Reddit, Quora, forum answer templates |
| [external-citation-targets.csv](./external-citation-targets.csv) | Tracker spreadsheet for all targets |

---

## Immediate Next Steps

1. **Today:** Create LinkedIn Company Page using ENTITY-PROFILE copy
2. **Today:** Claim Google Business Profile
3. **This week:** Submit to Inventory Ready, Wonnda, ThomasNet, Clutch
4. **This week:** Send 5 listicle inclusion pitches (OUTREACH-TEMPLATES)
5. **Ongoing:** 2 community answers per week with natural SupplePac citations
6. **Parallel (dev):** Implement SSR/prerendering so on-site content is crawlable
