import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_DATA_FILE = resolve("data/robots.json");
const ALLOWED_STATUSES = new Set([
  "source_linked_unverified",
  "verified",
  "conflicting",
  "outdated",
  "missing_source",
  "rejected",
]);

function add(issues, severity, code, path, message) {
  issues.push({ severity, code, path, message });
}

function uniqueIndex(items, path, issues) {
  const index = new Map();
  if (!Array.isArray(items)) {
    add(issues, "error", "COLLECTION_NOT_ARRAY", path, "Expected an array.");
    return index;
  }
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const id = item?.id;
    if (typeof id !== "string" || !id.trim()) {
      add(issues, "error", "MISSING_ID", `${path}[${i}].id`, "A non-empty string ID is required.");
      continue;
    }
    if (index.has(id)) {
      add(issues, "error", "DUPLICATE_ID", `${path}[${i}].id`, `ID "${id}" is already used at index ${index.get(id)}.`);
      continue;
    }
    index.set(id, i);
  }
  return index;
}

function isHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

function normalizeLabel(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/**
 * Read-only audit of the canonical ROBOSCOPIA JSON data.
 * It reports findings; it never edits, merges, fetches or deletes records.
 */
export function auditDatabase(db) {
  const issues = [];
  if (!db || typeof db !== "object" || Array.isArray(db)) {
    add(issues, "error", "INVALID_ROOT", "$", "The database root must be a JSON object.");
    return summarize(db, issues);
  }

  const manufacturers = uniqueIndex(db.manufacturers, "manufacturers", issues);
  const families = uniqueIndex(db.families, "families", issues);
  const categories = uniqueIndex(db.categories, "categories", issues);
  const sources = uniqueIndex(db.sources, "sources", issues);
  const records = uniqueIndex(db.records, "records", issues);

  if (typeof db.schemaVersion !== "string" || !db.schemaVersion.trim()) {
    add(issues, "error", "MISSING_SCHEMA_VERSION", "schemaVersion", "A schema version is required.");
  }

  const sourceById = new Map((db.sources || []).filter((item) => item?.id).map((item) => [item.id, item]));
  const modelKeys = new Map();

  for (let i = 0; i < (db.records || []).length; i += 1) {
    const record = db.records[i];
    const base = `records[${i}]`;
    if (!record || typeof record !== "object") {
      add(issues, "error", "INVALID_RECORD", base, "Model record must be an object.");
      continue;
    }

    for (const field of ["manufacturerId", "familyId", "category"]) {
      const collection = field === "manufacturerId" ? manufacturers : field === "familyId" ? families : categories;
      if (!collection.has(record[field])) {
        add(issues, "error", "BROKEN_REFERENCE", `${base}.${field}`, `Reference "${record[field] ?? ""}" does not resolve.`);
      }
    }

    for (const field of ["model", "manufacturer", "summary", "summarySr"]) {
      if (typeof record[field] !== "string" || !record[field].trim()) {
        add(issues, "warning", "INCOMPLETE_DOSSIER", `${base}.${field}`, `Model dossier is missing ${field}.`);
      }
    }

    const modelKey = [
      record.manufacturerId,
      normalizeLabel(record.model),
      normalizeLabel(record.generationId || record.generation || ""),
    ].join("|");
    if (normalizeLabel(record.model)) {
      if (modelKeys.has(modelKey)) {
        add(issues, "warning", "POTENTIAL_DUPLICATE_MODEL", base, `Model identity resembles records[${modelKeys.get(modelKey)}]; review manually. No records were merged.`);
      } else {
        modelKeys.set(modelKey, i);
      }
    }

    const configurations = Array.isArray(record.configurations) ? record.configurations : [];
    const configurationIds = new Set(configurations.map((item) => item?.id).filter(Boolean));
    for (let c = 0; c < configurations.length; c += 1) {
      const configuration = configurations[c];
      if (configuration?.specificationsVerified === false && configuration.specificationStatus !== "not_verified") {
        add(issues, "error", "CONFIGURATION_STATUS_CONTRADICTION", `${base}.configurations[${c}]`, "An unverified configuration must retain specificationStatus=not_verified.");
      }
      if (configuration?.specificationsVerified === true && configuration.specificationStatus !== "verified") {
        add(issues, "warning", "CONFIGURATION_REVIEW_REQUIRED", `${base}.configurations[${c}]`, "Configuration claims verified specifications but its status is not verified.");
      }
    }

    const specs = Array.isArray(record.specifications) ? record.specifications : [];
    const specificationValues = new Map();
    if (specs.length === 0) {
      add(issues, "warning", "NO_SPECIFICATIONS", `${base}.specifications`, "No technical specifications are recorded.");
    }

    for (let s = 0; s < specs.length; s += 1) {
      const spec = specs[s];
      const path = `${base}.specifications[${s}]`;
      if (!spec || typeof spec !== "object") {
        add(issues, "error", "INVALID_SPECIFICATION", path, "Specification must be an object.");
        continue;
      }
      if (typeof spec.name !== "string" || !spec.name.trim()) {
        add(issues, "error", "MISSING_SPECIFICATION_NAME", `${path}.name`, "Specification name is required.");
      }
      if (!Object.hasOwn(spec, "value") || spec.value === null || spec.value === "") {
        add(issues, "warning", "MISSING_SPECIFICATION_VALUE", `${path}.value`, "Specification value is empty.");
      }
      if (!spec.provenance || typeof spec.provenance !== "object") {
        add(issues, "error", "MISSING_PROVENANCE", `${path}.provenance`, "Every specification requires field-level provenance.");
        continue;
      }

      const provenance = spec.provenance;
      const specificationKey = [
        normalizeLabel(spec.name),
        normalizeLabel(spec.unit || ""),
        provenance.configurationId || "model-level",
      ].join("|");
      if (specificationValues.has(specificationKey) &&
          JSON.stringify(specificationValues.get(specificationKey).value) !== JSON.stringify(spec.value)) {
        add(issues, "warning", "POTENTIAL_SPECIFICATION_CONFLICT", path,
          `Value differs from another "${spec.name}" entry in the same model/configuration scope; review sources and conditions manually.`);
      } else if (!specificationValues.has(specificationKey)) {
        specificationValues.set(specificationKey, { value: spec.value, index: s });
      }
      if (!ALLOWED_STATUSES.has(provenance.verificationStatus)) {
        add(issues, "error", "INVALID_VERIFICATION_STATUS", `${path}.provenance.verificationStatus`, "Verification status is not in the allowed status list.");
      }
      if (provenance.applicableModelId !== record.id) {
        add(issues, "error", "MODEL_SCOPE_MISMATCH", `${path}.provenance.applicableModelId`, "Specification provenance must identify its containing model.");
      }
      for (const sourceId of new Set([spec.sourceId, provenance.sourceId].filter(Boolean))) {
        if (!sources.has(sourceId)) {
          add(issues, "error", "UNKNOWN_SOURCE_REFERENCE", path, `Source ID "${sourceId}" is not registered.`);
        }
      }
      if (spec.sourceId && provenance.sourceId && spec.sourceId !== provenance.sourceId) {
        add(issues, "error", "SOURCE_REFERENCE_MISMATCH", path, "Specification sourceId and provenance.sourceId disagree.");
      }
      if (provenance.configurationId && !configurationIds.has(provenance.configurationId)) {
        add(issues, "error", "UNKNOWN_CONFIGURATION_REFERENCE", `${path}.provenance.configurationId`, "Configuration reference does not exist on this model.");
      }
      if (spec.source && !isHttpsUrl(spec.source)) {
        add(issues, "error", "INVALID_SPECIFICATION_URL", `${path}.source`, "Specification source must be a valid HTTPS URL.");
      }
      if (!spec.source && !spec.sourceId && !provenance.sourceId) {
        add(issues, "warning", "SPECIFICATION_WITHOUT_SOURCE", path, "No source is attached to this technical value.");
      }
      if (provenance.verificationStatus === "verified" && provenance.checkedAt) {
        const checkedAt = Date.parse(provenance.checkedAt);
        if (Number.isFinite(checkedAt) && Date.now() - checkedAt > 365 * 24 * 60 * 60 * 1000) {
          add(issues, "warning", "STALE_VERIFIED_SPECIFICATION", `${path}.provenance.checkedAt`,
            "The verified value was last checked more than 365 days ago; review whether it is still current.");
        }
      }
      if (provenance.verificationStatus === "verified" && !provenance.checkedAt) {
        add(issues, "warning", "VERIFIED_WITHOUT_REVIEW_DATE", `${path}.provenance.checkedAt`, "Verified values should include the date of review.");
      }
    }

    for (let m = 0; m < (record.media || []).length; m += 1) {
      const media = record.media[m];
      const path = `${base}.media[${m}]`;
      if (!media?.rightsStatus) {
        add(issues, "error", "MEDIA_RIGHTS_STATUS_MISSING", `${path}.rightsStatus`, "Media reuse rights must be explicit.");
      } else if (media.rightsStatus === "permission_not_confirmed") {
        add(issues, "info", "MEDIA_NOT_CLEARED", `${path}.rightsStatus`, "Media must not be republished until permission or a compatible license is documented.");
      }
      if (media?.url && !isHttpsUrl(media.url)) {
        add(issues, "warning", "MEDIA_URL_NOT_HTTPS", `${path}.url`, "Media URL is not a valid HTTPS URL.");
      }
    }
  }

  for (let i = 0; i < (db.sources || []).length; i += 1) {
    const source = db.sources[i];
    if (!source || typeof source !== "object") continue;
    if (!isHttpsUrl(source.url)) {
      add(issues, "error", "INVALID_SOURCE_URL", `sources[${i}].url`, "Registered source URL must be a valid HTTPS URL.");
    }
    if (source.domain === "unknown") {
      add(issues, "warning", "SOURCE_DOMAIN_UNKNOWN", `sources[${i}].domain`, "Source domain has not been normalized.");
    }
    if (source.reviewStatus === "not_reviewed") {
      add(issues, "warning", "SOURCE_NOT_REVIEWED", `sources[${i}].reviewStatus`, "Source page and claim applicability have not been reviewed.");
    }
    for (const field of ["domain", "authorityTier", "reviewStatus"]) {
      if (typeof source[field] !== "string" || !source[field].trim()) {
        add(issues, "warning", "INCOMPLETE_SOURCE_METADATA", `sources[${i}].${field}`, `Source metadata is missing ${field}.`);
      }
    }
  }

  return summarize(db, issues);
}

function summarize(db, issues) {
  const counts = {
    error: issues.filter((item) => item.severity === "error").length,
    warning: issues.filter((item) => item.severity === "warning").length,
    info: issues.filter((item) => item.severity === "info").length,
  };
  return {
    reportVersion: "1.0.0",
    schemaVersion: db?.schemaVersion ?? null,
    recordCount: Array.isArray(db?.records) ? db.records.length : 0,
    generatedAt: new Date().toISOString(),
    counts,
    status: counts.error > 0 ? "failed" : counts.warning > 0 ? "review_required" : "passed",
    issues,
  };
}

export function formatReport(report) {
  const lines = [
    `ROBOSCOPIA Data Quality Audit — ${report.status.toUpperCase()}`,
    `Schema: ${report.schemaVersion ?? "unknown"} | Records: ${report.recordCount}`,
    `Errors: ${report.counts.error} | Warnings: ${report.counts.warning} | Info: ${report.counts.info}`,
  ];
  for (const issue of report.issues) {
    lines.push(`[${issue.severity.toUpperCase()}] ${issue.code} — ${issue.path}: ${issue.message}`);
  }
  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const failOnWarning = args.includes("--fail-on-warning");
  const fileArg = args.find((arg) => !arg.startsWith("--"));
  const filePath = resolve(fileArg || DEFAULT_DATA_FILE);
  const db = JSON.parse(await readFile(filePath, "utf8"));
  const report = auditDatabase(db);
  process.stdout.write(jsonOutput ? `${JSON.stringify(report, null, 2)}\n` : `${formatReport(report)}\n`);
  if (report.counts.error > 0 || (failOnWarning && report.counts.warning > 0)) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    process.stderr.write(`Data quality audit failed: ${error.message}\n`);
    process.exitCode = 2;
  });
}
