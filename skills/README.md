# Roboscopia Skills

Skills are procedural knowledge, not autonomous agents. They do not grant tools, permissions, network access, or write access.

## Quarantine policy

- Imported Skills are stored under `skills/quarantine/`.
- Quarantined means disabled; runtime loaders must not expose these Skills to agents.
- Every candidate requires provenance, licence/third-party notice review, security review, scope review, and tests.
- A Skill cannot grant itself capabilities or approve its own activation.
- Activation requires a separate reviewed change to the Skill Registry and policy tests.
- Canonical factual approval, rights decisions, publication, and catalogue changes remain human-controlled.

## Inventory

| Skill | Origin | Status | Intended use |
|---|---|---|---|
| `robotics-technical-research` | Adapted from Kalaris Labs / K-Dense MIT-licensed research Skill | Quarantined, disabled | Robotics/CNC technical claims and evidence provenance |

No runtime loader or automatic activation is introduced by this directory.
