import type { Question, QuestionType } from "../../types/game";
import type { Rng } from "../random/prng";

type RawQuestion = { expression: string; correctAnswer: number; type: QuestionType };
type Generator = (rng: Rng) => RawQuestion;

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ---- Level 1: Easy — addition, subtraction, small multiplication, simple division ----

const easyAddition: Generator = (rng) => {
  const a = rng.nextInt(1, 20);
  const b = rng.nextInt(1, 20);
  return { expression: `${a} + ${b}`, correctAnswer: a + b, type: "addition" };
};

const easySubtraction: Generator = (rng) => {
  const a = rng.nextInt(5, 20);
  const b = rng.nextInt(1, a);
  return { expression: `${a} - ${b}`, correctAnswer: a - b, type: "subtraction" };
};

const easyMultiplication: Generator = (rng) => {
  const a = rng.nextInt(1, 10);
  const b = rng.nextInt(1, 10);
  return { expression: `${a} × ${b}`, correctAnswer: a * b, type: "multiplication" };
};

const easyDivision: Generator = (rng) => {
  const b = rng.nextInt(1, 10);
  const quotient = rng.nextInt(1, 10);
  return { expression: `${b * quotient} ÷ ${b}`, correctAnswer: quotient, type: "division" };
};

// ---- Level 2: Moderate — larger multiplication/division, percentages, mixed ----

const moderateMultiplication: Generator = (rng) => {
  const a = rng.nextInt(10, 25);
  const b = rng.nextInt(2, 12);
  return { expression: `${a} × ${b}`, correctAnswer: a * b, type: "multiplication" };
};

const moderateDivision: Generator = (rng) => {
  const b = rng.nextInt(2, 12);
  const quotient = rng.nextInt(4, 20);
  return { expression: `${b * quotient} ÷ ${b}`, correctAnswer: quotient, type: "division" };
};

const roundPercentage: Generator = (rng) => {
  const percent = rng.pick([10, 20, 25, 50]);
  const denom = 100 / gcd(100, percent);
  const base = denom * rng.nextInt(1, 9);
  return { expression: `${percent}% of ${base}`, correctAnswer: (base * percent) / 100, type: "percentage" };
};

const mixedAddSub: Generator = (rng) => {
  const a = rng.nextInt(5, 20);
  const b = rng.nextInt(5, 20);
  const c = rng.nextInt(1, Math.min(a + b, 20));
  return { expression: `${a} + ${b} - ${c}`, correctAnswer: a + b - c, type: "mixed" };
};

// ---- Level 3: Hard — larger numbers, order of operations, powers, negatives, harder % ----

const largeAddSub: Generator = (rng) => {
  const a = rng.nextInt(50, 150);
  const b = rng.nextInt(50, 150);
  const isAdd = rng.next() < 0.5;
  return isAdd
    ? { expression: `${a} + ${b}`, correctAnswer: a + b, type: "addition" }
    : { expression: `${Math.max(a, b)} - ${Math.min(a, b)}`, correctAnswer: Math.max(a, b) - Math.min(a, b), type: "subtraction" };
};

const orderOfOperations: Generator = (rng) => {
  const a = rng.nextInt(5, 20);
  const b = rng.nextInt(2, 9);
  const c = rng.nextInt(2, 9);
  return { expression: `${a} + ${b} × ${c}`, correctAnswer: a + b * c, type: "order-of-operations" };
};

const powers: Generator = (rng) => {
  const base = rng.nextInt(2, 12);
  const exponent = rng.pick([2, 3]);
  const symbol = exponent === 2 ? "²" : "³";
  return { expression: `${base}${symbol}`, correctAnswer: base ** exponent, type: "power" };
};

const negatives: Generator = (rng) => {
  const a = rng.nextInt(1, 30);
  const b = rng.nextInt(1, 30);
  return { expression: `${a} - ${b}`, correctAnswer: a - b, type: "negative" };
};

const harderPercentage: Generator = (rng) => {
  const percent = rng.pick([15, 35, 45, 65, 85]);
  const denom = 100 / gcd(100, percent);
  const base = denom * rng.nextInt(1, 6);
  return { expression: `${percent}% of ${base}`, correctAnswer: (base * percent) / 100, type: "percentage" };
};

// ---- Level 4: Very Hard — multi-step, fractions, complex order of operations ----

const multiStep: Generator = (rng) => {
  const a = rng.nextInt(2, 15);
  const b = rng.nextInt(2, 15);
  const c = rng.nextInt(2, 6);
  const product = (a + b) * c;
  const d = rng.nextInt(1, Math.max(1, Math.min(product, 30)));
  return { expression: `(${a} + ${b}) × ${c} - ${d}`, correctAnswer: product - d, type: "multi-step" };
};

const fractionOf: Generator = (rng) => {
  const [numerator, denominator] = rng.pick([
    [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5],
  ]);
  const base = denominator * rng.nextInt(2, 12);
  return { expression: `${numerator}/${denominator} of ${base}`, correctAnswer: (base * numerator) / denominator, type: "fraction" };
};

const complexOrderOfOperations: Generator = (rng) => {
  const a = rng.nextInt(2, 9);
  const b = rng.nextInt(2, 9);
  const c = rng.nextInt(2, 9);
  const d = rng.nextInt(2, 9);
  return { expression: `${a} × ${b} + ${c} × ${d}`, correctAnswer: a * b + c * d, type: "order-of-operations" };
};

// ---- Level 5: Brutal — combinations of the above, still mentally solvable ----

const powerCombo: Generator = (rng) => {
  const a = rng.nextInt(3, 12);
  const b = rng.nextInt(2, 12);
  const c = rng.nextInt(2, 12);
  return { expression: `${a}² - ${b} × ${c}`, correctAnswer: a * a - b * c, type: "power" };
};

const brutalMultiStep: Generator = (rng) => {
  const a = rng.nextInt(10, 30);
  const b = rng.nextInt(2, 15);
  const c = rng.nextInt(2, 9);
  const d = rng.nextInt(1, 40);
  const isAdd = rng.next() < 0.5;
  const base = (a - b) * c;
  return isAdd
    ? { expression: `(${a} - ${b}) × ${c} + ${d}`, correctAnswer: base + d, type: "multi-step" }
    : { expression: `(${a} - ${b}) × ${c} - ${d}`, correctAnswer: base - d, type: "multi-step" };
};

const LEVEL_GENERATORS: Record<number, Generator[]> = {
  1: [easyAddition, easySubtraction, easyMultiplication, easyDivision],
  2: [moderateMultiplication, moderateDivision, roundPercentage, mixedAddSub],
  3: [largeAddSub, orderOfOperations, powers, negatives, harderPercentage],
  4: [multiStep, fractionOf, complexOrderOfOperations],
  5: [powerCombo, brutalMultiStep, multiStep, complexOrderOfOperations],
};

function generateDistractors(correct: number, rng: Rng): number[] {
  const magnitude = Math.max(1, Math.round(Math.abs(correct) * 0.12));
  const candidateDeltas = shuffle(
    [1, -1, 2, -2, 3, -3, magnitude, -magnitude, magnitude * 2, -magnitude * 2],
    rng,
  );

  const seen = new Set([correct]);
  const distractors: number[] = [];
  for (const delta of candidateDeltas) {
    const value = correct + delta;
    if (!seen.has(value)) {
      seen.add(value);
      distractors.push(value);
    }
    if (distractors.length === 3) break;
  }

  let fallback = 4;
  while (distractors.length < 3) {
    const value = correct + fallback * (distractors.length % 2 === 0 ? 1 : -1);
    if (!seen.has(value)) {
      seen.add(value);
      distractors.push(value);
    }
    fallback++;
  }

  return distractors;
}

export function generateQuestion(level: number, rng: Rng): Question {
  const clampedLevel = Math.min(5, Math.max(1, Math.round(level)));
  const generators = LEVEL_GENERATORS[clampedLevel];
  const raw = rng.pick(generators)(rng);
  const distractors = generateDistractors(raw.correctAnswer, rng);
  const options = shuffle([raw.correctAnswer, ...distractors], rng);

  return {
    expression: raw.expression,
    correctAnswer: raw.correctAnswer,
    options,
    difficulty: clampedLevel,
    type: raw.type,
  };
}
