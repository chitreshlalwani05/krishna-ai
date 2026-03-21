import fs from "fs";

const verses = JSON.parse(
  fs.readFileSync("./data/verses.json")
);

// simple keyword mapping
const keywordMap = {
  fear: ["fear", "darr", "anxiety"],
  confusion: ["confusion", "direction", "kya karu"],
  breakup: ["breakup", "relationship", "love"],
  laziness: ["lazy", "mann nahi", "motivation"],
  anger: ["anger", "gussa"],
};

export function searchVerses(problem) {
  const text = problem.toLowerCase();

  let matchedTheme = "action";

  for (let key in keywordMap) {
    for (let word of keywordMap[key]) {
      if (text.includes(word)) {
        matchedTheme = key;
      }
    }
  }

  const filtered = verses.filter(v =>
    v.theme.toLowerCase().includes(matchedTheme)
  );

  return filtered.length ? filtered.slice(0, 2) : verses.slice(0, 2);
}