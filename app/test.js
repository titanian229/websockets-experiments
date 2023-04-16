// const Diff = require("diff");

// const change = Diff.structuredPatch("testing", "testing", "Hello!", "Hello! test");
// console.log(change);
const { compare, applyPatch } = require("fast-json-patch");

let str1 = "Hello!";
const str2 = "Hello! Test";

const patch = compare(str1, str2);

console.log({ patch });

const newValue = applyPatch(str1.split(""), patch).newDocument.join("");

console.log(newValue);
