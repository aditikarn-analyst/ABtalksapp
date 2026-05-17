import fs from "node:fs";
import path from "node:path";

const AI_SOURCE =
  "c:/Users/sksoh/AppData/Local/Packages/5319275A.WhatsAppDesktop_cv1g1gvanyjgm/LocalState/sessions/B69B8188968119266B90C5943626B4A175B23F41/transfers/2026-20/ai_60_days_challenges_final (3).json";
const OUT = path.join(process.cwd(), "prisma", "content", "problems.json");

function slugTag(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function transformAi(raw) {
  const parts = [];
  if (raw.focusArea) parts.push(`**Focus Area:** ${raw.focusArea}`);
  if (raw.problemStatement) parts.push(raw.problemStatement);
  if (Array.isArray(raw.toolsUsed) && raw.toolsUsed.length) {
    parts.push(`\n**Tools:** ${raw.toolsUsed.join(", ")}`);
  }
  if (Array.isArray(raw.whatStudentsWillDo) && raw.whatStudentsWillDo.length) {
    parts.push("\n**What to do:**");
    for (const item of raw.whatStudentsWillDo) parts.push(`- ${item}`);
  }
  if (raw.deliverable) {
    parts.push("\n**Submission:**");
    parts.push(`- ${raw.deliverable}`);
  }

  const tags = new Set(["ai-engineering"]);
  if (raw.focusArea) tags.add(slugTag(raw.focusArea));
  if (Array.isArray(raw.toolsUsed)) {
    for (const tool of raw.toolsUsed) tags.add(slugTag(tool));
  }

  const learningObjectives = Array.isArray(raw.whatStudentsWillDo)
    ? raw.whatStudentsWillDo.slice(0, 6)
    : raw.focusArea
      ? [raw.focusArea]
      : [];

  return {
    dayNumber: raw.dayNumber,
    domain: "AI",
    title: raw.title,
    problemStatement: parts.join("\n"),
    learningObjectives,
    resources: [],
    difficulty: raw.difficulty ?? "Medium",
    estimatedMinutes: raw.estimatedMinutes ?? 60,
    linkedinTemplate: raw.linkedinTemplate ?? "",
    solutionApproach:
      raw.deliverable ??
      "Break the task into small engineering components, implement incrementally, test outputs carefully, and document tradeoffs.",
    tags: [...tags].filter(Boolean),
  };
}

const current = JSON.parse(fs.readFileSync(OUT, "utf8"));
const aiIncoming = JSON.parse(fs.readFileSync(AI_SOURCE, "utf8")).map(transformAi);

const aiByDay = new Map(
  current.filter((r) => r.domain === "AI").map((r) => [r.dayNumber, r]),
);
for (const row of aiIncoming) {
  aiByDay.set(row.dayNumber, row);
}
const aiMerged = [...aiByDay.values()].sort((a, b) => a.dayNumber - b.dayNumber);

const other = current.filter((r) => r.domain !== "AI");
const merged = [...other, ...aiMerged];

fs.writeFileSync(OUT, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
console.log("Updated", OUT);
console.log("AI rows:", aiMerged.length);
console.log("Total:", merged.length);
console.log(
  "AI day 8 title:",
  aiMerged.find((r) => r.dayNumber === 8)?.title,
);
