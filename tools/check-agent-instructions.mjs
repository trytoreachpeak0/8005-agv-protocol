// Checks the agent instruction pair (program#228, layout "jia"):
//   - AGENTS.md exists and holds the instructions;
//   - the first non-empty line of CLAUDE.md is exactly "@AGENTS.md", so Claude Code
//     loads the same text every other agent reads;
//   - .gitattributes names both files explicitly with eol=lf, git resolves both to
//     eol=lf, and the checked-out files carry no CR.
// Exit code 0 when all hold; 1 with one line per failure otherwise.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pair = ["AGENTS.md", "CLAUDE.md"];
const failures = [];
const read = (name) => {
  const file = path.join(root, name);
  if (!fs.existsSync(file)) { failures.push(`${name} is missing`); return null; }
  return fs.readFileSync(file, "utf8");
};
const lines = (text) => text.replace(/^﻿/, "").split("\n").map((l) => l.replace(/\r$/, "").trim());

const agents = read("AGENTS.md");
const claude = read("CLAUDE.md");
if (agents !== null && agents.trim() === "") failures.push("AGENTS.md is empty");
if (claude !== null) {
  const first = lines(claude).find((l) => l !== "");
  if (first !== "@AGENTS.md") failures.push(`CLAUDE.md must start with "@AGENTS.md", found ${JSON.stringify(first ?? "")}`);
}
for (const [name, text] of [["AGENTS.md", agents], ["CLAUDE.md", claude]]) {
  if (text !== null && text.includes("\r")) failures.push(`${name} contains CR characters; it must be checked out with LF endings`);
}

const gitattributes = read(".gitattributes");
if (gitattributes !== null) {
  const entries = lines(gitattributes).filter((l) => l !== "" && !l.startsWith("#")).map((l) => l.split(/\s+/));
  for (const name of pair) {
    if (!entries.some(([pattern, ...attrs]) => pattern === name && attrs.includes("eol=lf"))) {
      failures.push(`.gitattributes must name ${name} explicitly with eol=lf`);
    }
  }
}
const resolved = execFileSync("git", ["check-attr", "eol", "--", ...pair], { cwd: root, encoding: "utf8" });
for (const name of pair) {
  if (!resolved.split("\n").some((l) => l.trim() === `${name}: eol: lf`)) failures.push(`git does not resolve eol=lf for ${name}`);
}

if (failures.length > 0) {
  for (const f of failures) console.error(`agent-instructions: ${f}`);
  process.exit(1);
}
console.log("agent-instructions: ok");
