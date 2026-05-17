import fs from "node:fs";
import path from "node:path";

const DS_PATH =
  "c:/Users/sksoh/AppData/Local/Temp/Rar$DIa12268.15728.rartemp/problems.json";
const SE_PATH =
  "c:/Users/sksoh/AppData/Local/Temp/Rar$DIa9544.17485.rartemp/problems.json";
const OUT = path.join(process.cwd(), "prisma", "content", "problems.json");

function normalizeDomain(d) {
  if (!d) return null;
  const s = String(d).trim();
  if (s === "SE" || s === "DS" || s === "AI") return s;
  if (/software/i.test(s)) return "SE";
  if (/data science/i.test(s)) return "DS";
  if (/ai engineering|artificial intelligence|^ai$/i.test(s)) return "AI";
  return null;
}

function transformStandard(raw) {
  const domain = normalizeDomain(raw.domain);
  if (!domain) return null;

  const parts = [];
  if (raw.phase) parts.push(`**Phase:** ${raw.phase}`);
  if (raw.problemStatement) parts.push(raw.problemStatement);
  if (raw.realWorldImpact) {
    parts.push(`\n**Real-World Impact:** ${raw.realWorldImpact}`);
  }
  if (Array.isArray(raw.whatToDo) && raw.whatToDo.length) {
    parts.push("\n**What to do:**");
    for (const item of raw.whatToDo) parts.push(`- ${item}`);
  }
  if (Array.isArray(raw.submission) && raw.submission.length) {
    parts.push("\n**Submission:**");
    for (const item of raw.submission) parts.push(`- ${item}`);
  }

  return {
    dayNumber: raw.dayNumber,
    domain,
    title: raw.title,
    problemStatement: parts.join("\n"),
    learningObjectives: raw.learningObjectives ?? [],
    resources: raw.resources ?? [],
    difficulty: raw.difficulty ?? "Medium",
    estimatedMinutes: raw.estimatedMinutes ?? 60,
    linkedinTemplate: raw.linkedinTemplate ?? "",
    solutionApproach: raw.solutionApproach ?? "",
    tags: raw.tags ?? [],
  };
}

function loadProblems(filePath) {
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return Array.isArray(raw) ? raw : raw.problems;
}

const dsIncoming = loadProblems(DS_PATH).map(transformStandard).filter(Boolean);
const seIncoming = loadProblems(SE_PATH).map(transformStandard).filter(Boolean);

const current = JSON.parse(fs.readFileSync(OUT, "utf8"));

const byDomain = { SE: [], DS: [], AI: [] };
for (const row of current) {
  if (row.domain === "SE" || row.domain === "DS" || row.domain === "AI") {
    byDomain[row.domain].push(row);
  }
}

const seByDay = new Map(byDomain.SE.map((r) => [r.dayNumber, r]));
const dsByDay = new Map(byDomain.DS.map((r) => [r.dayNumber, r]));

for (const row of seIncoming) {
  seByDay.set(row.dayNumber, row);
}
for (const row of dsIncoming) {
  dsByDay.set(row.dayNumber, row);
}

function sortByDay(a, b) {
  return a.dayNumber - b.dayNumber;
}
byDomain.SE = [...seByDay.values()].sort(sortByDay);
byDomain.DS = [...dsByDay.values()].sort(sortByDay);
byDomain.AI.sort(sortByDay);

const merged = [...byDomain.SE, ...byDomain.DS, ...byDomain.AI];

fs.writeFileSync(OUT, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
console.log("Updated", OUT);
console.log("SE rows:", byDomain.SE.length);
console.log("DS rows:", byDomain.DS.length);
console.log("AI rows:", byDomain.AI.length);
console.log("Total:", merged.length);
