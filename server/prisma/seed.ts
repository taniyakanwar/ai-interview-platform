// seed.ts
// One-time script to populate the curated Problem bank.
// Run manually whenever you want to add more curated problems in bulk.
// These are NOT copied from LeetCode — summaries, examples, and hints are written in our own words.

import { prisma } from "../src/lib/prisma";


// Each entry here becomes one row in the Problem table.
// isCurated: true and createdById: null (omitted = null) mark these as globally shared.
const curatedProblems = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "EASY" as const,
    tags: ["Array", "HashMap"],
    summary:
      "Given an array of integers and a target value, find the indices of the two numbers that add up to the target. Each input has exactly one solution, and you can't use the same element twice.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9" },
    ],
    constraints: "2 <= nums.length <= 10^4",
    hints: [
      "A brute-force check of every pair works, but is O(n^2) — can you do better?",
      "Try storing numbers you've already seen in a hashmap as you iterate, so lookups become O(1).",
    ],
    estimatedTime: 15,
    sourceUrl: "https://leetcode.com/problems/two-sum",
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "EASY" as const,
    tags: ["Stack", "String"],
    summary:
      "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid — every opening bracket must be closed by the same type of bracket, in the correct order.",
    examples: [
      { input: 's = "()[]{}"', output: "true", explanation: "Every bracket is properly closed in order." },
      { input: 's = "(]"', output: "false", explanation: "Mismatched bracket types." },
    ],
    constraints: "1 <= s.length <= 10^4",
    hints: [
      "Think about what data structure naturally handles 'last opened, first closed' ordering.",
      "Push opening brackets onto a stack; when you see a closing bracket, check if it matches the top of the stack.",
    ],
    estimatedTime: 15,
    sourceUrl: "https://leetcode.com/problems/valid-parentheses",
  },
  {
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    difficulty: "EASY" as const,
    tags: ["Linked List"],
    summary:
      "Given the head of a singly linked list, reverse the list in place and return the new head.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]", explanation: "All pointers are reversed." },
    ],
    constraints: "0 <= number of nodes <= 5000",
    hints: [
      "You'll need three pointers: previous, current, and next — to avoid losing track of the rest of the list.",
      "Try both an iterative approach and a recursive approach once you solve it the first way.",
    ],
    estimatedTime: 20,
    sourceUrl: "https://leetcode.com/problems/reverse-linked-list",
  },
  {
    title: "Container With Most Water",
    slug: "container-with-most-water",
    difficulty: "MEDIUM" as const,
    tags: ["Array", "Two Pointers"],
    summary:
      "Given an array of heights representing vertical lines, find two lines that together with the x-axis form a container holding the most water.",
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "Lines at index 1 and 8 form the largest container." },
    ],
    constraints: "2 <= height.length <= 10^5",
    hints: [
      "Brute force checks every pair — O(n^2). A two-pointer approach starting from both ends can do this in O(n).",
      "At each step, move the pointer at the SHORTER line inward — moving the taller one can only decrease the area.",
    ],
    estimatedTime: 25,
    sourceUrl: "https://leetcode.com/problems/container-with-most-water",
  },
  {
    title: "Binary Search",
    slug: "binary-search",
    difficulty: "EASY" as const,
    tags: ["Binary Search", "Array"],
    summary:
      "Given a sorted array of integers and a target value, return the index of the target if found, otherwise return -1. Must run in O(log n) time.",
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4", explanation: "9 is found at index 4." },
    ],
    constraints: "1 <= nums.length <= 10^4, array is sorted",
    hints: [
      "O(log n) is a strong signal — think about repeatedly cutting the search space in half.",
      "Keep left/right pointers and compare the middle element to the target each iteration.",
    ],
    estimatedTime: 15,
    sourceUrl: "https://leetcode.com/problems/binary-search",
  },
];

async function main() {
  console.log("🌱 Seeding curated problems...");

  for (const problem of curatedProblems) {
    // upsert = "update if exists, insert if not" — based on the unique `slug` field.
    // This makes the seed script SAFE to re-run multiple times without creating duplicates.
    await prisma.problem.upsert({
      where: { slug: problem.slug },
      update: {}, // if it already exists, don't overwrite — just skip
      create: {
        ...problem,
        isCurated: true, // explicitly marks these as the shared curated bank
      },
    });
    console.log(`  ✔ ${problem.title}`);
  }

  console.log("🌿 Done seeding.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });