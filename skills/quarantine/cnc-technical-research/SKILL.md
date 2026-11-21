---
name: cnc-technical-research
description: Research CNC machine tools, controllers, spindles, axes, tooling and automation using traceable manufacturer evidence. Supervised procedural Skill only.
license: MIT
compatibility: Documentation-only; no runtime dependencies, network access, crawling, API keys, or autonomous tools.
metadata:
  version: "0.1.0"
  status: quarantined
  activation: disabled
  category: cnc-research
---

# CNC Technical Research

## Authority and scope

This Skill is untrusted procedural guidance. It is quarantined and disabled. It grants no permissions, tools, network access, filesystem access, catalogue write access, rights authority, or publication authority.

Use it only through a trusted, reviewed workflow with injected services. Never bypass access controls, authentication, paywalls, robots policies, rate limits, or source terms.

## Research targets

Identify the exact manufacturer, machine family, model, generation, configuration, region, controller, software revision, and optional equipment. Treat similarly named machines and option packages as distinct until evidence proves equivalence.

Research only fields relevant to the machine type, such as:

- Work envelope: X/Y/Z travel, turning diameter/length, table size, swing, clearance and tool capacity.
- Spindle: power, torque, speed range, taper/interface, duty cycle and cooling.
- Axes: number, linear/rotary travel, rapid traverse, feed range, positioning accuracy and repeatability.
- Tooling: toolholder standard, magazine capacity, tool-change time, probe and measurement options.
- Workholding: chuck/collet/table interface, clamping force, pallet dimensions and supported fixtures.
- Controls: controller manufacturer/model, CNC software version, supported programming formats, fieldbus and connectivity.
- Electrical/utilities: input voltage, phase, frequency, rated power, compressed air, coolant and extraction requirements.
- Physical installation: footprint, machine mass, floor loading, height, foundation and service clearances.
- Safety: enclosure, interlocks, guarding, emergency stop, safety standards and declarations.
- Commercial: price, lead time, warranty, service coverage and availability only when tied to a dated, geographically scoped source.

## Source hierarchy

Prefer, in order:
1. Official machine datasheet, technical specification, operating/installation manual, option list and manufacturer product page.
2. Official controller, spindle, toolholder and component manufacturer documentation.
3. Regulatory declarations, certificates and official technical notices.
4. Independent metrology, acceptance-test and application reports with method and conditions.
5. Reputable distributors and resellers as leads for commercial data.
6. Forums, videos and community posts as contextual leads only, never sole evidence for critical specifications.

Record the source publisher, exact title, canonical URL or identifier, publication/revision date, retrieval date, page/section/table/figure, model scope and source class.

## Claim and measurement discipline

For each claim preserve:
- original wording, value, unit and exact locator;
- normalized value and conversion method separately;
- machine model, generation, configuration and options;
- source revision/date and geographic applicability;
- claim type: manufacturer specification, independent measurement, calculation, estimate, price, availability, safety declaration or editorial interpretation;
- status and reviewer decision.

Do not conflate:
- axis travel with usable work envelope;
- spindle motor power with spindle output power or input power;
- peak torque with continuous torque;
- maximum spindle speed with speed under rated torque;
- rapid traverse with cutting feed;
- positioning accuracy with repeatability;
- machine accuracy with part accuracy;
- tool magazine capacity with usable tool capacity;
- standard equipment with optional accessories;
- nominal dimensions with installation clearances.

For measured performance preserve test standard, instrument, calibration, thermal state, workpiece/material, tool, feed/speed, measurement location, test method and uncertainty where supplied.

Never calculate an unsupported machine capability from isolated component specifications. Never assume two controller models, toolholder interfaces, rotary axes, probes or post-processors are compatible merely because they share a brand.

## CNC compatibility matrix

Evaluate each proposed interface separately and use only these outcomes:
- `documented_compatible`: exact interface and required conditions are supported by authoritative documentation.
- `documented_incompatible`: authoritative documentation explicitly rules it out.
- `conditional_compatibility`: supported only with named options, adapters, firmware, configuration or operating conditions.
- `unverified`: insufficient evidence.
- `conflicting_evidence`: credible sources disagree.
- `not_applicable`: interface does not apply.

Potential interfaces include machine/controller, controller/software version, post-processor, toolholder/spindle taper, collet/chuck, probe, rotary axis, workholding, robot loading, safety PLC, fieldbus, CAD/CAM output and power/utilities.

Do not turn `unverified` into compatible by inference. Compatibility findings remain review candidates, not purchasing or safety approvals.

## Rights and provenance

Track access, processing, local storage, display/embedding, redistribution and attribution separately for every manual, drawing, photo, video and dataset. A public manual does not automatically grant permission to republish it. A licence for text/specifications does not necessarily cover logos, photographs, diagrams or third-party content.

## Output

Return a review package containing:
1. Exact machine identity and configuration.
2. Source ledger with revision and exact locators.
3. Technical claim ledger with original and normalized values.
4. Interface compatibility matrix with conditions.
5. Conflicts, missing evidence and uncertainty.
6. Rights and attribution status.
7. Human review questions.

No catalogue mutation, fact approval, safety certification, publication or marketplace listing is permitted. Human technical and rights review remains mandatory.
