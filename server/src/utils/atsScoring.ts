interface ScoreCheck {
  score: number;
  maxScore: number;
  label: string;
}

const REQUIRED_SECTIONS = ["experience", "education", "skills", "projects"];

const ACTION_VERBS = [
  "built", "developed", "designed", "implemented", "created", "led",
  "managed", "optimized", "reduced", "increased", "launched", "architected",
  "automated", "improved", "deployed", "engineered", "spearheaded",
];

// Common English words that show up in every JD/resume regardless of role —
// filtering these out is what makes "missing skills" actually mean skills,
// not just "words in the JD you didn't happen to repeat."
const STOPWORDS = new Set([
  "the", "and", "for", "are", "with", "you", "your", "our", "will",
  "have", "has", "this", "that", "from", "who", "looking", "looking",
  "role", "job", "work", "working", "team", "teams", "years", "year",
  "experience", "strong", "excellent", "ability", "able", "must",
  "should", "can", "may", "also", "using", "used", "use", "any", "all",
  "including", "such", "etc", "other", "than", "into", "about", "across",
  "candidate", "candidates", "responsibilities", "requirements", "preferred",
]);

// Single shared implementation — used by both checkKeywordOverlap and
// getMissingSkills, so a fix here (like the stopword bug) applies everywhere
// instead of needing to be duplicated and kept in sync manually.
function extractKeywords(text: string): Set<string> {
  const words = text.toLowerCase().match(/\b[a-z][a-z0-9+#.]{2,}\b/g) || [];
  return new Set(words.filter((w) => w.length > 2 && !STOPWORDS.has(w)));
}

function checkSections(text: string): ScoreCheck {
  const lower = text.toLowerCase();
  const found = REQUIRED_SECTIONS.filter((section) => lower.includes(section));
  return {
    score: found.length,
    maxScore: REQUIRED_SECTIONS.length,
    label: "Standard section headers present",
  };
}

function checkContactInfo(text: string): ScoreCheck {
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/.test(text);
  const score = (hasEmail ? 1 : 0) + (hasPhone ? 1 : 0);
  return { score, maxScore: 2, label: "Contact information detectable" };
}

function checkQuantifiedAchievements(text: string): ScoreCheck {
  const matches = text.match(/\d+(\.\d+)?%|\$\d+|\d+x\b|\b\d{2,}\+?\b/g) || [];
  const score = Math.min(matches.length, 5);
  return { score, maxScore: 5, label: "Quantified achievements (numbers/metrics)" };
}

function checkActionVerbs(text: string): ScoreCheck {
  const lower = text.toLowerCase();
  const found = ACTION_VERBS.filter((verb) => lower.includes(verb));
  const score = Math.min(found.length, 5);
  return { score, maxScore: 5, label: "Strong action verbs" };
}

function checkLength(text: string): ScoreCheck {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const score = wordCount >= 200 && wordCount <= 900 ? 3 : wordCount >= 100 ? 1 : 0;
  return { score, maxScore: 3, label: "Appropriate length" };
}

function checkKeywordOverlap(resumeText: string, targetJD?: string): ScoreCheck {
  if (!targetJD) {
    return { score: 0, maxScore: 0, label: "Job description keyword match (not provided)" };
  }

  const jdKeywords = extractKeywords(targetJD);
  const resumeKeywords = extractKeywords(resumeText);
  const overlap = [...jdKeywords].filter((k) => resumeKeywords.has(k));
  const overlapRatio = jdKeywords.size > 0 ? overlap.length / jdKeywords.size : 0;

  return {
    score: Math.round(overlapRatio * 10),
    maxScore: 10,
    label: "Job description keyword match",
  };
}

export function getMissingSkills(resumeText: string, targetJD?: string): string[] {
  if (!targetJD) return [];

  const jdKeywords = extractKeywords(targetJD);
  const resumeKeywords = extractKeywords(resumeText);

  return [...jdKeywords].filter((k) => !resumeKeywords.has(k)).slice(0, 15);
}

export function calculateAtsScore(resumeText: string, targetJD?: string) {
  const checks = [
    checkSections(resumeText),
    checkContactInfo(resumeText),
    checkQuantifiedAchievements(resumeText),
    checkActionVerbs(resumeText),
    checkLength(resumeText),
    checkKeywordOverlap(resumeText, targetJD),
  ];

  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const totalMax = checks.reduce((sum, c) => sum + c.maxScore, 0);
  const atsScore = Math.round((totalScore / totalMax) * 100);

  const scoreBreakdown = Object.fromEntries(
    checks.map((c) => [c.label, `${c.score}/${c.maxScore}`])
  );

  return { atsScore, scoreBreakdown };
}