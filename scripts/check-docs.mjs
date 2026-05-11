import { readFile } from "node:fs/promises";

const requiredDocs = [
  "AGENTS.md",
  "README.md",
  "docs/ai-development-workflow.md",
  ".planning/PROJECT.md",
  ".planning/ROADMAP.md",
  ".planning/STATE.md",
  ".planning/MILESTONES.md"
];

async function read(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    throw new Error(`Missing required documentation: ${path}`, {
      cause: error
    });
  }
}

function requireIncludes(sourceName, source, refs) {
  const missing = refs.filter((ref) => !source.includes(ref));
  if (missing.length > 0) {
    throw new Error(
      `${sourceName} missing required cross-reference(s): ${missing.join(", ")}`
    );
  }
}

const docs = new Map();
for (const doc of requiredDocs) {
  docs.set(doc, await read(doc));
}

requireIncludes("README.md", docs.get("README.md"), [
  "AGENTS.md",
  "docs/ai-development-workflow.md",
  ".planning/PROJECT.md",
  ".planning/ROADMAP.md",
  ".planning/STATE.md",
  ".planning/MILESTONES.md"
]);

requireIncludes("AGENTS.md", docs.get("AGENTS.md"), [
  "README.md",
  "docs/ai-development-workflow.md",
  ".planning/PROJECT.md",
  ".planning/ROADMAP.md",
  ".planning/STATE.md",
  ".planning/MILESTONES.md"
]);

requireIncludes(".planning/STATE.md", docs.get(".planning/STATE.md"), [
  ".planning/PROJECT.md",
  ".planning/ROADMAP.md"
]);

requireIncludes(
  "docs/ai-development-workflow.md",
  docs.get("docs/ai-development-workflow.md"),
  ["Claude Opus", "Codex", "npm run ai:implement", "$gsd-execute-phase"]
);

console.log("Documentation alignment check passed.");
