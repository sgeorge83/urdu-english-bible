import { readFileSync } from "node:fs";
import { parseReferenceString } from "../js/reference-parser.js";

const plan = JSON.parse(readFileSync("./data/book-of-common-prayer-plan.json", "utf8"));
const keys = ["First Psalm", "Second Psalm", "Old Testament", "New Testament", "Gospel"];
const failures = [];
let parsed = 0;

for (let i = 0; i < plan.length; i += 1) {
  for (const key of keys) {
    const text = plan[i][key] ?? "";
    if (!text) continue;
    try {
      parseReferenceString(text);
      parsed += 1;
    } catch (err) {
      failures.push({ day: i + 1, key, text, error: err.message });
    }
  }
}

const luke = parseReferenceString("Luke 20:41-21:4");
const ezekiel = parseReferenceString("Ezekiel 1:28-3:3");
const john = parseReferenceString("John 7:53-8:11");

console.log("days", plan.length);
console.log("parsed_fields", parsed);
console.log("failures", failures.length);
if (failures.length) console.log(JSON.stringify(failures, null, 2));
console.log("luke", JSON.stringify(luke, null, 2));
console.log("ezekiel", JSON.stringify(ezekiel, null, 2));
console.log("john", JSON.stringify(john, null, 2));
if (failures.length) process.exit(1);
