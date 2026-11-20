# ROBOSCOPIA canonical data model

## Status

Schema version: 2.0.0  
Canonical file: `data/robots.json`

This is the current application-facing JSON model. It is intentionally backward-compatible with the existing catalog and dossier readers: `records[]` remains the list of robot profiles.

## Entity hierarchy

```text
Manufacturer
  └── Product family
        └── Model
              ├── Generation (optional, only when evidenced)
              └── Configuration / variant (optional, model-specific)
                    └── Specifications
```

- **Manufacturer** is a distinct organization.
- **Family** is scoped to one manufacturer. Identically named families from different manufacturers must never be merged.
- **Model** is a distinct product identity with a stable, URL-safe `id`.
- **Generation** is optional. Leave it null until reliable evidence establishes it.
- **Configuration** records a manufacturer-defined configuration or package. A configuration may exist in the identity catalog before its technical values have been verified.

## Current top-level collections

- `manufacturers[]`: normalized manufacturer directory, IDs and linked model IDs.
- `families[]`: manufacturer-scoped product family directory.
- `categories[]`: controlled category vocabulary with English and Serbian labels.
- `records[]`: complete model profiles used by the website.

## Model record fields

- `id`: permanent model identifier; do not recycle.
- `manufacturerId`, `familyId`: normalized references.
- `generationId`: nullable generation key.
- `model`, `manufacturer`, `family`, `category`, `variant`: human-readable identity.
- `summary`, `summarySr`: English and Serbian descriptions.
- `configurations[]`: model-specific configurations; empty when none are recorded.
- `specifications[]`: evidence-backed values, each with its own source URL and optional qualifier.
- `sources[]`: source records for the profile.
- `media[]`, `mediaStatus`: media provenance and rights status.

## Configuration verification policy

A configuration entry with `specificationsVerified: false` is an identity placeholder only. It must not be presented as a verified technical configuration and must not inherit model-level specifications automatically.

For Unitree Go2, AIR, PRO, X and EDU are recorded as research targets. Configuration-specific specifications remain unverified. H1 and H1-2 must remain separate model identities.

## Data integrity rules

1. Never invent model IDs, generations, specifications, prices, availability, source URLs or media permissions.
2. Preserve original source units and qualifiers; conversions must be explicit and traceable.
3. Do not combine values from different generations or configurations.
4. Each technical value should carry a source URL appropriate to that value.
5. Unknown values remain null or absent; do not replace them with guessed values.
6. A model can have multiple configurations; a configuration must belong to exactly one model.
7. Manufacturer and family references must resolve to existing directory entries.
8. Category IDs must resolve to the controlled category vocabulary.
9. Media rights status must remain explicit; an external preview is not permission to republish.
10. Add new schema versions deliberately and preserve a documented migration path.

## Future database mapping

When a database is approved, map these collections to relational tables:

- `manufacturers`
- `product_families`
- `robot_models`
- `model_generations`
- `model_configurations`
- `specifications`
- `sources`
- `media_assets`
- `categories`

Use stable IDs and foreign keys. Do not create or migrate a live database as part of this schema definition.
